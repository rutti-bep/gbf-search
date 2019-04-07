$(function() {
  var socket = io.connect("https://obscure-forest-66282.herokuapp.com/");
  var raidsList = document.getElementById("raidsList");
  var clipboardElm = document.getElementById("clipboard");

  socket.on('msg', function(data) {
    console.log(data);
    if(isCopyRaid(data)){      
      console.log(raids);
      execRaidCopy(data);
    }
  });  
});

var raids = [{name:"Lv120 グリームニル",flag:true}];

function isCopyRaid(text){
  var _bossName = text.match(/Lv[0-9]{2,3}[\s\S]+https:/);
  var bossName = _bossName[0].slice(0,_bossName.length-7);

  var notListin = true;
  for(var i = 0; i < raids.length; i++){
    if(raids[i].name == bossName){
      notListin = false;
      if(raids[i].flag){
        return true;
      }else{
        return false;
      }
    }
  }
  
  if(notListin){
    console.log("raid add! : " + bossName);
    raids.push({name:bossName,flag:false});
    raidsSort();
  }
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
  
function execRaidCopy(string){
  var pre = document.createElement('pre');

  raidsList.appendChild(pre).textContent = string;

  var _battleId = string.match(/[0-9A-Z]{8}\s:参戦ID/);
  var battleId = _battleId[0].slice(0,8);

  chrome.runtime.sendMessage({text: battleId});
}
