"use strict";
const request = require("request");
const Twitter = require("twitter");
const ncp = require("copy-paste");
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
  var params = {q : "参加者募集！"}   
  setInterval(function (){
  client.get('search/tweets', params, function(error, tweets, response) {
    if (!error) {
      for(var i = 0;i < tweets.statuses.length; i ++ ){
        var text = tweets.statuses[i].text.replace(/\n/g,"");
        if(text.match(/参加者募集！参戦ID：[0-9A-Z]{8}Lv[0-9]{2,3}\s.+https:\/\/t\.co\/[a-zA-Z0-9]+$/g)){
          console.log("match : "+text);

          var _bossName = text.match(/Lv[0-9]{2,3}\s.+https:/);
          var bossName = _bossName[0].slice(0,_bossName.length-7);

          var _battleId = text.match(/参戦ID：[0-9A-Z]{8}/).slice(-8);
          var battleId = _battleId[0].slice(-8);

          console.log("bossName : "+ bossName);
          console.log("battleId : " + battleId);

          if(bossName.match(/Lv100 Dエンジェル・オリヴィエ/)){
            console.log("copy : "+battleId);
            (function(id){
              return ncp.copy(id, function () {
                console.log("copied! : "+id);
              })
            })(battleId);
          }
        }
      }
    }else{
      console.log(error);
    }
  });
  },1000*5);
}
