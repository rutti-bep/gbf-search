var isRunApp = false;

var socket;
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var response = {"status":true};
  switch (request.method){
    case "getRunApp":
      response["isRun"]=isRunApp;
      break;
    case "toggleRunApp": 
      isRunApp = !isRunApp;      
      console.log("move",isRunApp)
      if(isRunApp){
        socket = io.connect("https://obscure-forest-66282.herokuapp.com/");
        chrome.browserAction.setBadgeBackgroundColor({ color: [31, 155, 31, 255] });
        socket.on('msg', function(data) {
          //console.log(data);
          if(isCopyRaid(data)){      
            var _battleId = data.match(/[0-9A-Z]{8}\s:参戦ID/);
            var battleId = _battleId[0].slice(0,8);
            saveToClipboard(battleId);
          }
        });
        socket.on('disconnect', function(){
          chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        });
      }else{
        socket.close();
      }
      response["isRun"]=isRunApp;
      break;
    case "getCopyList":
      console.log(raidsCopyList);
      response["list"]=raidsCopyList;
      break;
    case "addCopyList":
      raidsCopyList.push(request.raid);
      localStorage.setItem("raidsCopyList",JSON.stringify(raidsCopyList));
      console.log(raidsCopyList)
        response["list"]=raidsCopyList;
      break;
    case "deleteCopyList":
      raidsCopyList = raidsCopyList.filter((raidName)=>{
        return request.raid !== raidName
      });
      localStorage.setItem("raidsCopyList",JSON.stringify(raidsCopyList)); 
      console.log(raidsCopyList)
        response["list"]=raidsCopyList;
      break;
    case "getRaids":
      response["raids"]=raids;
      break;
  }
  sendResponse(response);
});


//raids情報取得
var raids = {};
var raidsCopyList = localStorage.getItem("raidsCopyList")!==null?JSON.parse(localStorage.getItem("raidsCopyList")):[];
var file = 'dest/json/raids.json';
var xhr = new XMLHttpRequest();
xhr.open('GET', chrome.runtime.getURL(file), true);
xhr.onreadystatechange = function() {
  if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
    raids = JSON.parse(xhr.responseText);
    raids["Other"] = [new Array()];
  }
}
xhr.send();

//raidsコピーするかのリスト

function isCopyRaid(text){
//  console.log(text);
  var _bossName = text.match(/参加者募集！[\s\S]+https:/);
  var bossName = _bossName[0].slice(6,_bossName.length-7);
//  console.log(bossName)

  var notListin = true;
  var returnValue = false;
  Object.keys(raids).forEach(function(level) {
    Object.keys(raids[level]).forEach(function(stars) {
      raids[level][stars].forEach((raidName)=>{
        if(raidName == bossName){
          notListin = false;
        }
      })
    })
  });


  if(notListin){
    console.log("raid add! : " + bossName);
    raids["Other"][0].push(bossName);
    console.log(raids["Other"][0]);
    raidsOtherSort();
    chrome.runtime.sendMessage({"method":"raidsAdd","raid":bossName}); 
  }

  raidsCopyList.forEach((raid)=>{
    if(raid == bossName){
      returnValue = true;
    }
  });
  return returnValue;
}

function raidsOtherSort(){
  raids["Other"][0].sort(function(a,b){
    var aLv = Number(a.slice(2,5).replace(" ",""));
    var bLv = Number(b.slice(2,5).replace(" ",""));
    var _return;
    if(aLv == bLv){
      return a.localeCompare(b);
    }else{
      return aLv >= bLv ? 1 : -1;
    }
  })
}

function saveToClipboard(str) {
  var textArea = document.createElement("textarea");
  textArea.style.cssText = "position:absolute;left:-100%";

  document.body.appendChild(textArea);

  textArea.value = str;
  textArea.select();
  console.log(str,document.execCommand("copy"));

  chrome.browserAction.setBadgeText({text:String(new Date().getSeconds())});
  document.body.removeChild(textArea);
  Beep();
}

function Beep(){
  console.log("beep");
  new Audio("data:audio/wav;base64,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").play();
}
