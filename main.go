package main

import (
	"github.com/michimani/gotwi"
	"net/http"
)

func main() {
	client, err := newOAuth2Client()
	if err != nil {
		panic(err)
	}

	//	createRules(client)
	samplingTweets(client)
}

func newOAuth2Client() (*gotwi.Client, error) {
	in2 := &gotwi.NewClientInput{
		AuthenticationMethod: gotwi.AuthenMethodOAuth2BearerToken,
		HTTPClient:           &http.Client{Timeout: 0},
	}

	return gotwi.NewClient(in2)
}
