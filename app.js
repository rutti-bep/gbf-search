"use strict";
const request = require("request");
const Twitter = require("twitter");
const fs = require("fs");

const tokens = require("./tokens.json");

console.log(tokens);

if(!tokens.bearerToken){
  var bearerTokenCredentials = new Buffer(tokens.consumerKey + ":" + tokens.consumerSecret).toString('base64');
  var headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8.",
    "Authorization": "Basic "+ bearerTokenCredentials
  }

  var options = {
    url : "https://api.twitter.com/oauth2/token",
    method : "POST",
    headers : headers,
    body: "grant_type=client_credentials",
    json: true
  }

  request(options, function (error, response, body) {
    if(error) throw "token error : "+ error;
    tokens.bearerToken = body["access_token"]
    fs.writeFile('tokens.json', JSON.stringify(tokens, null, '    '));
    search();
  })
}else{
  search();
}

function search(){
  var client = new Twitter({
    consumer_key: tokens.consumerKey,
    consumer_secret: tokens.consumerSecret,
    bearer_token: tokens.bearerToken
  });

/*  var stream = client.stream('statuses/filter', {track: 'javascript'});
  stream.on('data', function(event) {
    console.log(event && event.text);
  });

  stream.on('error', function(error) {
    throw error;
  });*/
  
     var params = {q: "%E6%95%91%E6%8F%B4%E8%80%85%E5%8B%9F%E9%9B%86%EF%BC%81"};
     client.get('search/tweets', params, function(error, tweets, response) {
     if (!error) {
     console.log(tweets);
     }else{
     console.log(error)
     }
     });
     
}
