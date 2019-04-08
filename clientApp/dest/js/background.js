var isRunApp = false;

var socket;
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
        socket.on('msg', function(data) {
          //console.log(data);
          if(isCopyRaid(data)){      
            var _battleId = data.match(/[0-9A-Z]{8}\s:参戦ID/);
            var battleId = _battleId[0].slice(0,8);
            saveToClipboard(battleId);
          }
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
  var _bossName = text.match(/Lv[0-9]{2,3}[\s\S]+https:/);
  var bossName = _bossName[0].slice(0,_bossName.length-7);

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

  document.body.removeChild(textArea);
}


