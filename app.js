"use strict";
const Twitter = require("twitter");
const ncp = require("copy-paste");
const colors = require("colors");
const fs = require("fs");

const tokens = require("./tokens.json");

//console.log(tokens);

search();

function search(){
  var client = new Twitter({
    consumer_key: tokens.consumerKey,
    consumer_secret: tokens.consumerSecret,
    access_token_key: tokens.accessToken,
    access_token_secret: tokens.accessTokenSecret
  });

  client.stream('statuses/filter', {track: 'ID'}, function(stream) {
    stream.on('data', function(event) {
     try{
      if(event.text == undefined) return;
      var text = event.text.replace(/\n/g,"");
      if(text.match(/参加者募集！参戦ID：[0-9A-Z]{8}Lv[0-9]{2,3}\s.+https:\/\/t\.co\/[a-zA-Z0-9]+$/g)){
//        console.log("match : "+text);

        var _bossName = text.match(/Lv[0-9]{2,3}\s\S+https:/);
        var bossName = _bossName[0].slice(0,_bossName.length-7);

        var _battleId = text.match(/参戦ID：[0-9A-Z]{8}/).slice(-8);
        var battleId = _battleId[0].slice(-8);

        console.log("battleId : " + battleId+" bossName : "+ bossName);
//      console.log("battleId : " + battleId);

        if(bossName.match(/Lv100\sDエンジェル・オリヴィエ/)){
          (function(id,name){
            return ncp.copy(id, function () {
              console.log(colors.bgWhite("copied! : "+bossName+" id : "+id));
            })
          })(battleId,bossName);
        }else if(bossName.match(/Lv100\s黒麒麟/)){
          (function(id,name){
            return ncp.copy(id, function () {
              console.log(colors.rainbow("copied! : "+bossName+" id : "+id));
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
