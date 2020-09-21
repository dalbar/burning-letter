package main

import (
	"bytes"
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"log"
	"net/http"
	"regexp"
)

const notesEp = "/notes/"

const bucketName = "burning-letter"

var sess = session.Must(session.NewSession(&aws.Config{
	Region: aws.String("eu-central-1")},
))

var uploader = s3manager.NewUploader(sess)
var svc = s3.New(sess)

// Note contains a message and an expiry date
type Note struct {
	message    string
	expiresRaw string
}

func handleGetNote(w http.ResponseWriter, r *http.Request) {
	var validID = regexp.MustCompile(`^\/notes\/([a-z0-9\-]+)`)
	var matches = validID.FindAllStringSubmatch(r.URL.Path, 1)

	if matches == nil || len(matches[0]) != 2 {
		http.Error(w, "no valid note id was specified", http.StatusBadRequest)
		return
	}

	resp, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(matches[0][1]),
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	defer resp.Body.Close()

	buf := new(bytes.Buffer)
	buf.ReadFrom(resp.Body)

	fmt.Fprintf(w, buf.String())
}

func handleCreateNote(w http.ResponseWriter, r *http.Request) {

}

func handleNote(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		handleGetNote(w, r)
		return
	}

	if r.Method == http.MethodPost {
		handleCreateNote(w, r)
		return
	}

	http.Error(w, "HTTP Verb is not supported", http.StatusBadRequest)
}

func main() {
	http.HandleFunc(notesEp, handleNote)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
