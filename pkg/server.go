package main

import (
	"bytes"
	"crypto/rand"
	b64 "encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/google/uuid"
	"golang.org/x/crypto/chacha20poly1305"
)

// -------------------------------------------------------------------------------
// Custom Types used in the API
// -------------------------------------------------------------------------------

// IDResponse is used to indicate the client where his new note is created/located
type IDResponse struct {
	ID string `json:"id"`
}

// -------------------------------------------------------------------------------
// Global variables
// -------------------------------------------------------------------------------

// aws s3 bucket name
const bucketName = "burning-letter"

// build aws session, assumption is that aws credentials are in environment
// check aws docs for more info
var sess = session.Must(session.NewSession(&aws.Config{
	Region: aws.String("eu-central-1"),
},
))

// interface to s3 build upon previously created session
var svc = s3.New(sess)

// -------------------------------------------------------------------------------
// Utility functions
// -------------------------------------------------------------------------------

// dclose is used to log errors on defered closing
func dclose(f io.Closer) {
	if err := f.Close(); err != nil {
		log.Print(err.Error())
	}
}

// generateSecret is generating a pseudo-random 32 byte key
func generateSecret() []byte {
	key := make([]byte, chacha20poly1305.KeySize)

	if _, err := rand.Read(key); err != nil {
		panic(err)
	}

	return key
}

func deleteNoteFromAWS(id string) {
	_, err := svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(id),
	})

	if err != nil {
		log.Println(err.Error())
	}
}

// notes are only allowed to persist for max 3 days (72h)
func isValidExpiration(expiration time.Duration) bool {
	return expiration <= time.Hour*72
}

// -------------------------------------------------------------------------------
// HTTP Handler functions
// -------------------------------------------------------------------------------

// handleGetNote retreives a note from amazon and requests removing the note (TODO)
// It does not decrypt the message. We want to give the user the option to decrypt
// his own messages.
// url param for uuid: /notes/{id}
// output:
// - 404, if invalid uuid or already cleaned up uuid is provided
// - 500, aws answer is not able to fit buffer
// - 200, returns content of message as plain text
func handleGetNote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")

	id := chi.URLParam(r, "id")

	resp, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(id),
	})
	if err != nil {
		http.Error(w, "Key not found", http.StatusNotFound)
		return
	}

	defer dclose(r.Body)

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(resp.Body)

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Could not read aws response into buffer", http.StatusInternalServerError)

		return
	}

	defer deleteNoteFromAWS(id)

	fmt.Fprint(w, b64.URLEncoding.EncodeToString(buf.Bytes()))
}

// handleCreateNote is encrypting a note and saving the result to s3
//	a fresh uuid is generated for every note therefore making guessing
//  of notes infeasible
// outputs:
// - 400, no body therefore no note to create
// - 400, invalid json provided (e.g syntax error)
// - 400, message or secret is not b64 encoded
// - 400, encryption was not successful (most likely because of invalid key e.g not 32 byte)
// - 500, upload to s3 failed
// - 500, marshaling failed for id response (unlikely unless aws provides weird answer)
// - 200, json which includes generated uuid for note
func handleCreateNote(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		http.Error(w, "No Body was attached", http.StatusBadRequest)

		return
	}

	defer dclose(r.Body)

	dec := json.NewDecoder(r.Body)

	var data Note

	err := dec.Decode(&data)

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Invalid json provided", http.StatusBadRequest)

		return
	}

	expiresIn, err := time.ParseDuration(data.DeleteAfter)

	if err != nil || !isValidExpiration(expiresIn) {
		http.Error(w, "invalid expiration time given", http.StatusBadRequest)
		return
	}

	// Secret is b64 decoded, revert for encryption
	data.Secret, err = b64.URLEncoding.DecodeString(data.SecretB64)

	if err != nil {
		http.Error(w, "secret is not a valid base64 encryption", http.StatusBadRequest)
		return
	}

	id := uuid.New().String()

	err = data.encryptMessage()
	if err != nil {
		http.Error(w, "encryption was not successful", http.StatusBadRequest)
		return
	}

	_, err = svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(id),
		Body:   bytes.NewReader(data.Message),
	})

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Upload to s3 failed", http.StatusInternalServerError)
	}

	out, err := json.Marshal(&IDResponse{ID: id})

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Could not build response", http.StatusInternalServerError)

		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(out)

	if err != nil {
		log.Print(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)

		return
	}

	go func() {
		log.Println("started timer")
		time.Sleep(time.Second)

		deleteNoteFromAWS("random")
		log.Println("deleted")

	}()

}

// offer a handler for options to handle browser option requests
func handleOptions(w http.ResponseWriter, r *http.Request) {
	// never expose server to public
}

// handleRandomKey write a randomly generated 32 byte key
// keys are not stored at any time
// output, base64 string
func handleRandomKey(w http.ResponseWriter, r *http.Request) {
	key := generateSecret()

	fmt.Fprint(w, b64.URLEncoding.EncodeToString(key))
}

// handleDecrypt decrypts a given message with a given secret
// query parameters:
// - message, base64 string
// - secret, base64 string
// outputs:
// - 400, secret is not in base64 format
// - 400, message is not in base64 format
// - 400, tampered message or invalid secret (decryption fails or nonce invalid)
// - 200, returns encrypted message
func handleDecrypt(w http.ResponseWriter, r *http.Request) {
	messageB64 := r.URL.Query().Get("message")
	secretB64 := r.URL.Query().Get("secret")

	secret, err := b64.URLEncoding.DecodeString(secretB64)
	if err != nil {
		http.Error(w, "secret is not base64", http.StatusBadRequest)
		return
	}

	message, err := b64.URLEncoding.DecodeString(messageB64)
	if err != nil {
		http.Error(w, "message is not base64", http.StatusBadRequest)
		return
	}

	tmpNote := Note{Message: message, Secret: secret}

	err = tmpNote.decryptMessage()

	tmpNote.cleanS3Quotes()

	if err != nil {
		http.Error(w, "message has been tampered with or secret is invalid", http.StatusBadRequest)
		return
	}

	fmt.Fprint(w, string(tmpNote.Message))
}

// -------------------------------------------------------------------------------
// Middleware functions
// -------------------------------------------------------------------------------

// enable cors for every requests, never make this api public with these configs
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		next.ServeHTTP(w, r)
	})
}

// -------------------------------------------------------------------------------
// Main function
// -------------------------------------------------------------------------------

func main() {
	r := chi.NewRouter()

	// chi middleware
	r.Use(middleware.Logger)
	r.Use(corsMiddleware)

	r.Route("/notes", func(r chi.Router) {
		r.Get("/{id}", handleGetNote)
		r.Post("/", handleCreateNote)
		r.Options("/", handleOptions)
	})

	r.Get("/random/key", handleRandomKey)

	r.Get("/decrypt", handleDecrypt)

	log.Fatal(http.ListenAndServe(":8080", r))
}
