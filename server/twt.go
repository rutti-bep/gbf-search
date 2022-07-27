package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/michimani/gotwi"
	"github.com/michimani/gotwi/tweet/filteredstream"
	"github.com/michimani/gotwi/tweet/filteredstream/types"
)

func newOAuth2Client() (*gotwi.Client, error) {
	in2 := &gotwi.NewClientInput{
		AuthenticationMethod: gotwi.AuthenMethodOAuth2BearerToken,
		HTTPClient:           &http.Client{Timeout: 0},
	}

	return gotwi.NewClient(in2)
}

func createRules(client *gotwi.Client) {

	p := &types.CreateRulesInput{
		Add: []types.AddingRule{
			{Value: gotwi.String("参戦ID参加者募集！")},
		},
	}

	stream, err := filteredstream.CreateRules(context.Background(), client, p)
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	fmt.Println(stream)
}

func recieveStream(client *gotwi.Client) {

	p := &types.SearchStreamInput{}
	stream, err := filteredstream.SearchStream(context.Background(), client, p)
	if err != nil {
		fmt.Println(err)
		return
	}

	cnt := 0
	for stream.Receive() {
		cnt++
		tweet, err := stream.Read()
		if err != nil {
			fmt.Println(err)
		} else {
			if tweet != nil {
				fmt.Println(cnt, gotwi.StringValue(tweet.Data.ID), gotwi.StringValue(tweet.Data.Text))
			}
		}
	}
}

func writeLog(cnt int, id string, txt string) {

	fmt.Println(cnt, id, txt)
}
