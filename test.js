"use strict";
const twitter = require('twitter');

const twitterToken = {
  consumer_key:"DB7Fo4mQh2oKEGlTmH5LRAtGQ",
  consumer_secret:"MbOLda86zlX4XIh5EbJJdum93cVK8j2Cg2Qps4UQ8Z9Bq4bziN",
  access_token_key:"715302500379693056-6iD7svP3K38Ht55bS6ZxIjl4gY7r2UH",
  access_token_secret:"P5Brj4NUFrvpu8TPgZGqur6gH3WRYgtaJMH5mTyeuB4O7"
}
var twit = new twitter(twitterToken);

var keyword = "ID 参加者募集！"; //検索語句 ID
var option = {'track': keyword};

twit.stream('statuses/filter', option, function(stream) {
  stream.on('data', function (data) {
    console.log(data.text)
    var text = data.text.replace(/\n/g,"");
    if(text.match(/[0-9A-Z]{8}\s:参戦ID参加者募集！(Lv[0-9]{2,3}\s)*.+https:\/\/t\.co\/[a-zA-Z0-9]+$/g)){
      //console.log(text)
    }
  });
});



