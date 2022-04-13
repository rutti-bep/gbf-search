console.log("load : background.js")

function clipboardCopy(str){
  var _battleId = str.match(/[0-9A-Z]{8}\s:参戦ID/);
  var battleId = _battleId[0].slice(0,8);
  var textArea = document.createElement("textarea");
  textArea.style.cssText = "position:absolute;left:-100%";

  document.body.appendChild(textArea);

  textArea.value = battleId;
  textArea.select();
  console.log(str,document.execCommand("copy"));

  chrome.browserAction.setBadgeText({text:String(new Date().getSeconds())});
  document.body.removeChild(textArea);
}

function setBadge(text){
  switch (text){
    case "red":
      chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
      break;
    case "green":
      chrome.browserAction.setBadgeBackgroundColor({ color: [31, 155, 31, 255] });
      break;
  }
}

function jsonRead(path){
  return new Promise((resolve,reject)=>{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.runtime.getURL(path), true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        resolve(xhr.responseText);
      }else if(xhr.readyState == XMLHttpRequest.DONE){
        reject(xhr);
      }
    }
    xhr.send();
  })
}

var raids = {};
var raidsCopyList = localStorage.getItem("raidsCopyList")!==null?JSON.parse(localStorage.getItem("raidsCopyList")):[];
var raidsPath = 'dest/json/raids.json';

jsonRead(raidsPath)
  .then((res)=>{
    raids = JSON.parse(res);
    raids["Other"] = [localStorage.getItem("raidsOtherList")!==null?JSON.parse(localStorage.getItem("raidsOtherList")):[]];
    console.log(raids)
  })
.catch((err)=>{return console.log("error",err)})

var tokens,config;
var tokensPath = 'tokens.json';
var twitterController;

jsonRead(tokensPath)
  .then((res)=>{
    tokens = JSON.parse(res);
    config = {
      "request_url": "https://api.twitter.com/oauth/request_token",
      "authorize_url": "https://api.twitter.com/oauth/authorize",
      "access_url": "https://api.twitter.com/oauth/access_token",
      "consumer_key": tokens["consumer_key"],
      "consumer_secret": tokens["consumer_secret"]
    }
    if(localStorage.getItem("oauth_tokenundefined")!==null){
       tokens["access_token_key"] = localStorage.getItem("oauth_tokenundefined");
       tokens["access_token_secret"] = localStorage.getItem("oauth_token_secretundefined");    
       twitterController = new twitterConnectionController(tokens); 
    }
  })
.catch((err)=>{return console.log("error",err)})


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var response = {"status":true};
  switch (request.method){
    case "getRunApp":
      response["isRun"]= twitterController.stream!=null;
      break;
    case "toggleRunApp": 
      if(twitterController.stream!=null){
        twitterController.StopStream();
        setBadge("red"); 
        response["isRun"]=false;
      }else{
        twitterController.StartStream(raidsCopyList);
        response["isRun"]=true;
      }
      break;
    case "getCopyList":
      response["list"]=raidsCopyList;
      break;
    case "addCopyList":
      raidsCopyList.push(request.raid);
      localStorage.setItem("raidsCopyList",JSON.stringify(raidsCopyList));
      if(twitterController.stream!=null){
        twitterController.StopStream();
        twitterController.StartStream(raidsCopyList);
      }
      response["list"]=raidsCopyList;
      break;
    case "deleteCopyList":
      raidsCopyList = raidsCopyList.filter((raidName)=>{
        return request.raid !== raidName
      });
      localStorage.setItem("raidsCopyList",JSON.stringify(raidsCopyList)); 
      if(twitterController.stream!=null){
        twitterController.StopStream();
        twitterController.StartStream(raidsCopyList);
      }
      response["list"]=raidsCopyList;
      break;
    case "addOtherRaids":
      raids["Other"][0].push(request.bossName);
      localStorage.setItem("raidsOtherList",JSON.stringify(raids["Other"][0]))
      response["raids"]=raids;
      break;
    case "fixOtherRaids":
      var i=0;
      for (const raidName of raids["Other"][0]){
        if(request.oldBossName == raidName){
          raids["Other"][0][i] = request.newBossName;
          localStorage.setItem("raidsOtherList",JSON.stringify(raids["Other"][0]))
          break;
        }
        i++;
      }
      i=0;
      for (const raidName of raidsCopyList){
        if(request.oldBossName == raidName){
          raidsCopyList[i] = request.newBossName
          localStorage.setItem("raidsCopyList",JSON.stringify(raidsCopyList)); 
          break;
        }
        i++;
      }
      response["list"]=raids["Other"][0];
      break;
    case "getRaids":
      response["raids"]=raids;
      break;
    case "twitterAuth":
      var oauth = ChromeExOAuth.initBackgroundPage(config);
      oauth.callback_page = 'dest/html/oauthPage.html';
      oauth.authorize((token, secret) => {
        console.log(token, secret);
        tokens["access_token_key"] = token;
        tokens["access_token_secret"] = secret;    
        twitterController = new twitterConnectionController(tokens);
      })
      break;
  }
  console.log(response);
  sendResponse(response);
});
