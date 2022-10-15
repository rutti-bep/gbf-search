package main

import (
	"context"
	"log"
	"time"

	"github.com/sivchari/gotwtr"
)

func main() {
	client := gotwtr.New("key")
	ch := make(chan gotwtr.VolumeStreamsResponse, 5)
	errCh := make(chan error)
	stream := client.VolumeStreams(context.Background(), ch, errCh)
	log.Println("streaming...")
	done := make(chan struct{})
	go func(done chan struct{}) {
		for {
			select {
			case data := <-ch:
				log.Println(data.Tweet)
			case err := <-errCh:
				log.Println(err)
			case <-done:
				return
			}
		}
	}(done)
	time.Sleep(time.Second * 10)
	close(done)
	stream.Stop()
	log.Println("done")
}
