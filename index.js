"use strict";

var tokens = require("./settings/tokens.json");
var log = require("./js/log.js");
var raids,config;

try{
  raids = require("./settings/raids.json");
}catch(e){
  raids = [];
  log.txtWrite("raidsが読み込めませんでした")
}
try{
  config = requrie("./settings/config");
}catch (e){
  config = {
    copy : true,
    copyTime : Date.now(),
    loadGauge : Date.now(),
    log : false
  };
  log.txtWrite("configが読み込めませんでした")
}

console.log(raids);
console.log(config);
