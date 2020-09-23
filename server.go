package main

import (
	"bytes"
	"crypto/rand"
	b64 "encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/google/uuid"
	"golang.org/x/crypto/chacha20poly1305"
	"log"
	"net/http"
)

const bucketName = "burning-letter"

var sess = session.Must(session.NewSession(&aws.Config{
	Region: aws.String("eu-central-1")},
))

var svc = s3.New(sess)

// Note contains a message and an expiry date
type Note struct {
	Message     json.RawMessage `json:"note"`
	DeleteAfter string
	// Secrets received from clients will be base64 encoded
	SecretB64 string `json:"secret"`
	// when receiving a note with a secret, make sure to decode the b64 version for encryption
	Secret []byte
}

// IDResponse is used to indicate the client where his new note is created/located
type IDResponse struct {
	ID string `json:"id"`
}

func handleGetNote(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
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

	defer resp.Body.Close()

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(resp.Body)

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Could not read aws response into buffer", http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, b64.StdEncoding.EncodeToString(buf.Bytes()))
}

func handleCreateNote(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		http.Error(w, "No Body was attached", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()

	dec := json.NewDecoder(r.Body)
	var data Note

	err := dec.Decode(&data)

	if err != nil {
		log.Print(err.Error())
	}

	// Secret is b64 decoded, revert for encryption
	data.Secret, err = b64.StdEncoding.DecodeString(data.SecretB64)

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

	w.Header().Set("Access-Control-Allow-Origin", "*")
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
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "Post, Get, Options")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

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

func handleRandomKey(w http.ResponseWriter, r *http.Request) {
	key := generateSecret()
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Fprint(w, b64.StdEncoding.EncodeToString(key))
}

func handleDecrypt(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
	messageB64 := r.URL.Query().Get("message")
	secretB64 := r.URL.Query().Get("secret")

	secret, err := b64.StdEncoding.DecodeString(secretB64)

	if err != nil {
		http.Error(w, "secret is not base64", http.StatusBadRequest)
		return
	}

	message, err := b64.StdEncoding.DecodeString(messageB64)

	if err != nil {
		http.Error(w, "message is not base64", http.StatusBadRequest)
		return
	}

	tmpNote := Note{Message: message, Secret: secret}

	err = tmpNote.decryptMessage()

	if err != nil {
		http.Error(w, "message has been tampered with or secret is invalid", http.StatusBadRequest)
		return
	}

	fmt.Fprint(w, string(tmpNote.Message))
}

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Route("/notes", func(r chi.Router) {
		r.Get("/{id}", handleGetNote)
		r.Post("/", handleCreateNote)
		r.Options("/", handleOptions)
	})

	r.Get("/random/key", handleRandomKey)

	r.Get("/decrypt", handleDecrypt)

	log.Fatal(http.ListenAndServe(":8080", r))
}
