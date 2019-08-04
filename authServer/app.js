"use strict";
const util = require('util');
const twitter = require('twitter');
const http = require('http');

const twitterToken ={
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_KEY,
  access_token_secret: process.env.ACCESS_SECRET
}

var twit = new twitter(twitterToken);

var keyword = "ID"; //検索語句 ID
var option = {'track': keyword};
console.log(keyword+'を含むツイートを取得します。');


var app = require('http').createServer(function(req, res) {
}).listen(process.env.PORT||3000);

const io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
    socket.on('msg', function(data) {
          io.sockets.emit('msg', data);
            });
});

twit.stream('statuses/filter', option, function(stream) {
    stream.on('data', function (data) {
          var text = data.text.replace(/\n/g,"");
          if(text.match(/[0-9A-Z]{8}\s:参戦ID参加者募集！(Lv[0-9]{2,3}\s)*.+https:\/\/t\.co\/[a-zA-Z0-9]+$/g)){
            io.sockets.emit('msg', text);
            //console.log(text)
          }
    });
});
