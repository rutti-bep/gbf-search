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

var raids = {};
var raidsCopyList = localStorage.getItem("raidsCopyList")!==null?JSON.parse(localStorage.getItem("raidsCopyList")):[];
var file = 'dest/json/raids.json';

var xhr = new XMLHttpRequest();
xhr.open('GET', chrome.runtime.getURL(file), true);
xhr.onreadystatechange = function() {
  if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
    raids = JSON.parse(xhr.responseText);
    raids["Other"] = [new Array()];
    console.log(raids)
  }
}
xhr.send();

//ひ・み・つ
const tokens = {
      consumer_key:"DB7Fo4mQh2oKEGlTmH5LRAtGQ",
      consumer_secret:"MbOLda86zlX4XIh5EbJJdum93cVK8j2Cg2Qps4UQ8Z9Bq4bziN",
      access_token_key:"715302500379693056-6iD7svP3K38Ht55bS6ZxIjl4gY7r2UH",
      access_token_secret:"P5Brj4NUFrvpu8TPgZGqur6gH3WRYgtaJMH5mTyeuB4O7"
}

const twitterController = new twitterConnectionController(tokens);

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
      response["raids"]=raids;
      break;
    case "getRaids":
      response["raids"]=raids;
      break;
  }
  console.log(response);
  sendResponse(response);
});




