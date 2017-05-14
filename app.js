"use strict";
const request = require("request");
const Twitter = require("twitter");
const ncp = require("copy-paste");
const colors = require("colors");
const fs = require("fs");

var _ = require('lodash')
const isTweet = _.conforms({
  contributors: _.isObject,
  id_str: _.isString,
  text: _.isString,
})
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
    access_token_key: tokens.accessToken,
    access_token_secret: tokens.accessTokenSecret
      //bearer_token: tokens.bearerToken
  });

  client.stream('statuses/filter', {track: 'ID'}, function(stream) {
    stream.on('data', function(event) {
     try{
       var text = event.text.replace(/\n/g,"");
      if(text.match(/参加者募集！参戦ID：[0-9A-Z]{8}Lv[0-9]{2,3}\s.+https:\/\/t\.co\/[a-zA-Z0-9]+$/g)){
        console.log("match : "+text);

        var _bossName = text.match(/Lv[0-9]{2,3}\s.+https:/);
        var bossName = _bossName[0].slice(0,_bossName.length-7);

        var _battleId = text.match(/参戦ID：[0-9A-Z]{8}/).slice(-8);
        var battleId = _battleId[0].slice(-8);

        console.log("bossName : "+ bossName);
        console.log("battleId : " + battleId);

        if(bossName.match(/Lv100\sセレスト・マグナ/)){
          console.log("copy : "+battleId);
          (function(id,name){
            return ncp.copy(id, function () {
              console.log(colors.bgWhite("copied! : "+bossName+id));
            })
          })(battleId,bossName);
        }else if(bossName.match(/Lv100\s黒麒麟/)){
          console.log("copy : "+battleId);
          (function(id,name){
            return ncp.copy(id, function () {
              console.log(colors.rainbow("copied! : "+bossName+id + colorReset));
            })
          })(battleId,bossName);
        }
      }
     }catch(e){
      console.log(e);
      console.log(event.text)
     }
    });

    stream.on('error', function(error) {
      throw error;
    });
  });

}
