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

// Note contains a message and an expiry date
type Note struct {
	Message     json.RawMessage `json:"note"`
	DeleteAfter string
	// Secrets received from clients will be base64 encoded
	SecretB64 string `json:"secret"`
	// when receiving a note with a secret, make sure to decode the b64 version for encryption
	Secret []byte
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

// aws is inserting quotes upon saving messages to buckets TODO (figure out why)
func (note *Note) cleanS3Quotes() {
	note.Message = note.Message[1 : len(note.Message)-1]
}

// -------------------------------------------------------------------------------
// Crypto functions
// -------------------------------------------------------------------------------

func (note *Note) encryptMessage() (err error) {
	aead, err := chacha20poly1305.New(note.Secret)
	if err != nil {
		fmt.Printf("Could not create cypher instance!")
		return err
	}

	nonce := make([]byte, chacha20poly1305.NonceSize, chacha20poly1305.NonceSize+len(note.Message)+aead.Overhead())
	if _, err := rand.Read(nonce); err != nil {
		panic(err)
	}

	// Encrypt the message and append the ciphertext to the nonce.
	note.Message = aead.Seal(nonce, nonce, note.Message, nil)

	return nil
}

func (note *Note) decryptMessage() (err error) {
	aead, err := chacha20poly1305.New(note.Secret)
	if err != nil {
		fmt.Printf("Could not create cypher instance!")
		return err
	}

	if len(note.Message) < chacha20poly1305.NonceSize {
		return fmt.Errorf("ciphertext too short")
	}

	// Split nonce and ciphertext.
	nonce, ciphertext := note.Message[:chacha20poly1305.NonceSize], note.Message[chacha20poly1305.NonceSize:]

	// Decrypt the message and check it wasn't tampered with.
	note.Message, err = aead.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		panic(err)
	}

	return nil
}

func generateSecret() []byte {
	key := make([]byte, chacha20poly1305.KeySize)

	if _, err := rand.Read(key); err != nil {
		panic(err)
	}

	return key
}

// -------------------------------------------------------------------------------
// HTTP Handler functions
// -------------------------------------------------------------------------------

// handleGetNote retreives a note
func handleGetNote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")

	id := chi.URLParam(r, "id")

	resp, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(id),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
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

	fmt.Fprint(w, b64.URLEncoding.EncodeToString(buf.Bytes()))
}

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
	}

	// Secret is b64 decoded, revert for encryption
	data.Secret, err = b64.URLEncoding.DecodeString(data.SecretB64)

	if err != nil {
		http.Error(w, "secret is not a valid base64 encryption", http.StatusBadRequest)
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
}

func handleOptions(w http.ResponseWriter, r *http.Request) {
	// never expose server to public
}

func handleRandomKey(w http.ResponseWriter, r *http.Request) {
	key := generateSecret()

	fmt.Fprint(w, b64.URLEncoding.EncodeToString(key))
}

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

// enable cors for requests, never make this api public with these configs
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
