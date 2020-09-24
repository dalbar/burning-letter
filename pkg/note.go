package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"golang.org/x/crypto/chacha20poly1305"
)

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
// Utility functions
// -------------------------------------------------------------------------------

// aws is inserting quotes upon saving messages to buckets TODO (figure out why)
func (note *Note) cleanS3Quotes() {
	note.Message = note.Message[1 : len(note.Message)-1]
}

// -------------------------------------------------------------------------------
// Crypto functions
// -------------------------------------------------------------------------------

// encryptMessage uses chacha20poly1305 to encrypt and mutate the given note's message
// returns error if encrypt fails
//	- secret is invalid e.g not 32 byte
// stores nonce and inserts in front of encrypted message to ensure integrity
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

// decryptMessage uses chacha20poly1305 to decrypt and mutate the given note's message
// returns error if decrypt fails
//	- secret is invalid e.g not 32 byte
//	- nonce is invalid
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
