"use strict";
const twitter = require('twitter');

class twitterConnectionController{
  constructor(tokens){
    this.tokens = tokens
   // this.twitter = null;
    this.stream = null;
  }

  StartStream(jpRaids,enRaids){
    const twit = new twitter(this.tokens);
    const keyword = "ID 参加者募集！ "+jpRaids.join(",ID 参加者募集！ ")+",ID Battle "+enRaids.join(",ID Battle "); //検索語句 ID
    const option = {'track': keyword};
    console.log(keyword);
    this.stream = twit.stream('statuses/filter', option);
    this.stream.on('data', function (data) {
      var text = data.text.replace(/\n/g,"");
      if(text.match(/[0-9A-Z]{8}\s:参戦ID参加者募集！(Lv[0-9]{2,3}\s)*.+https:\/\/t\.co\/[a-zA-Z0-9]+$/g)){
        clipboardCopy(text,"jp");
      }
      if(text.match(/^[0-9A-Z]{8}\s:Battle ID.+(Lv\s[0-9]{2,3}\s)*.+https:\/\/t\.co\/[a-zA-Z0-9]+$/g)){
        clipboardCopy(text,"en");
      }
    });
    this.stream.on('error',function (err){
      console.log("err");
      setBadge("red"); 
    })
    setBadge("green");
  }

  StopStream(){
    this.stream.destroy();
    this.stream = null;
  }
}

window.twitterConnectionController = twitterConnectionController;
