package main

func main() {
	client, err := newOAuth2Client()
	if err != nil {
		panic(err)
	}

	//	createRules(client)
	recieveStream(client)
}
