"use strict";
const Twitter = require("twitter");
const ncp = require("copy-paste");
const colors = require("colors");
const fs = require("fs");

const tokens = require("./tokens.json");
var raids,settings;
try{
  raids = require("./raids.json");
/*  var newRaids = []
  raids.map(function(raid){
    newRaids.push({name:raid,flag:false});
  })
  raids = newRaids
*/
  raidsSort();
  fs.writeFile('./raids.json', JSON.stringify(raids, null, '    '));
}catch(e){
  console.log("raids.jsonが読み込めませんでした")
  raids = [];
}
/*try{
  settings = require("./settings.json");
}catch(e){
  console.log("setting.jsonが読み込めませんでした")
  */settings = {
  copy : true,
  log : false
  }
//}

//console.log(tokens);

raidsSort();
raidsPrint();
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

          if(settings.log){
            console.log("battleId : " + battleId+" bossName : "+ bossName);
            console.log("battleId : " + battleId);
          }

          var notListin = true;
          for(var i = 0; i < raids.length; i++){
            if(raids[i].name == bossName){
              notListin = false;
              if(raids[i].flag){
                if(settings.copy){
                  (function(id,name){
                    return ncp.copy(id, function () {
                      console.log(colors.yellow("copied! : "+name+" id : "+id));
                    })
                  })(battleId,bossName);
                }else{
                  console.log(colors.blue("copied! : "+bossName+" id : "+battleId));
                }
              }
            }
          }

          if(notListin){
            console.log("raid add! : " + bossName);
            raids.push({name:bossName,flag:false});
            raidsSort();
            fs.writeFile('./raids.json', JSON.stringify(raids, null, ' '));
            if(settings.log){
              raidsPrint();
            }
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

function raidsSort(){
  raids.sort(function(a,b){
    var aLv = Number(a.name.slice(2,5).replace(" ",""));
    var bLv = Number(b.name.slice(2,5).replace(" ",""));
    var _return;
    if(aLv == bLv){
      return a.name.localeCompare(b.name);
    }else{
      return aLv >= bLv ? 1 : -1;
    }
  })
}

function raidsPrint(){
  console.log("~~raids~~");
  for(var i = 0; i < raids.length; i++){
    var flagStr = raids[i].flag?colors.yellow(" true"):colors.blue("false");
    console.log("id" + ("00"+i).slice(-2) + " catch: " + flagStr + " name: " + raids[i].name);
  }
  console.log("")
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  chunk.trim().split('\n').forEach(function(line) {
    try{
      if(line.match(/^catch/)){
        var splitedLine = line.split(/\s+/);
        if(raids[Number(splitedLine[2])] != undefined){
          if(splitedLine[1] == "on"){
            raids[Number(splitedLine[2])].flag = true;
            console.log("on : " + raids[Number(splitedLine[2])].name);
            fs.writeFile('./raids.json', JSON.stringify(raids, null, ' '));
          }else{
            raids[Number(splitedLine[2])].flag = false;
            console.log("off : " + raids[Number(splitedLine[2])].name);
            fs.writeFile('./raids.json', JSON.stringify(raids, null, ' '));
          }
        }else{
          console.log("sorry! not found!")
        }
      }else if(line.match(/^copy on/)){
        settings.copy = true;
        console.log("copy on")
      }else if(line.match(/^copy off/)){
        settings.copy = false;
        console.log("copy off")
      }else if(line.match(/^raids/)){
        raidsPrint();
      }else if(line.match(/^settings/)){
        console.log(settings);
      }
    }catch(e){
      console.log(e);
    }
  });
});
// EOFがくると発生するイベント
process.stdin.on('end', function () {
  console.log("end!")
});
