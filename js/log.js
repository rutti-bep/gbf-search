"use strict";
var fs = require("fs");

class Logger {
  constructor(){
    var dirPath = __dirname.split( '/' ).slice( 0, -1 ).join( '/' )+"/logs";
    this.logUrl = dirPath+"/log-"+Date.now()+".txt";
    console.log("log :",this.logUrl);
  }

  txtWrite(text){
    fs.appendFile(this.logUrl,text,'utf-8',function(err){
      if(err){
        console.log(err);
      }
    });
  }
}

module.exports = new Logger();
