package main

import (
	"context"
	"fmt"

	"github.com/michimani/gotwi"
	"github.com/michimani/gotwi/tweet/filteredstream"
	"github.com/michimani/gotwi/tweet/filteredstream/types"
)

func createRules(c *gotwi.Client) {
	p := &types.CreateRulesInput{
		Add: []types.AddingRule{
			{Value: gotwi.String("参戦ID参加者募集！")},
		},
	}
	s, err := filteredstream.CreateRules(context.Background(), c, p)
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	fmt.Println(s)
}

func samplingTweets(c *gotwi.Client) {

	p := &types.SearchStreamInput{}
	s, err := filteredstream.SearchStream(context.Background(), c, p)
	if err != nil {
		fmt.Println(err)
		return
	}

	cnt := 0
	for s.Receive() {
		cnt++
		t, err := s.Read()
		if err != nil {
			fmt.Println(err)
		} else {
			if t != nil {

				fmt.Println(cnt, gotwi.StringValue(t.Data.ID), gotwi.StringValue(t.Data.Text))
			}
		}
	}
}

func writeLog(cnt int, id string, txt string) {
	fmt.Println(cnt, id, txt)
	return
}
