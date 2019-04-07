$(function() {
  var appToggle = $("#appToggle");
  var raidsListToggle = $("#raidsListToggle");
  var raidsList = $("#raidsList");
  var copyLogs = $("#copyLogs");
  
  var raids = [];

  var socket = io.connect("https://obscure-forest-66282.herokuapp.com/");
  socket.on('msg', function(data) {
    //console.log(data);
    if(isCopyRaid(data)){      
      execRaidCopy(data);
    }
  });
  
  appToggle.click(()=>{
    isRunApp = !appToggle.prop("checked");
    if(isRunApp){
      socket.close();
    }else{
      socket = io.connect("https://obscure-forest-66282.herokuapp.com/");
      socket.on('msg', function(data) {
        //console.log(data);
        if(isCopyRaid(data)){      
          execRaidCopy(data);
        }
      });
    }
  });

  raidsListToggle.click(()=>{
    raidsListToggle.prop("checked");
    raidsList.slideToggle();
  });

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
      raidsListUpdate();
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

  function raidsListUpdate(){
    console.log(raids);
    raidsList.empty();
    raids.forEach((raid,index)=>{
      var $raidSpan = $("<li></li>").css({"height":"100%"})
      let $raidToggleButton = $('<input></input>',{
        type: "checkbox",
        checked: raids[index].flag,
        //css: {float:"left"},
        on: {
          click:()=> { 
            $raidToggleButton.prop("checked");
            raids[index].flag=!raids[index].flag;
            console.log(raids);
          }
        }
      });
      let $raidNameLabel = $('<div></div>',{
        text:raid.name,
        css: {"display": "inline"}
      });
      $raidSpan.append($raidToggleButton);
      $raidSpan.append($raidNameLabel);
      raidsList.append($raidSpan);
    })
  }

  function execRaidCopy(string){
    copyLogs.prepend("<div>"+string+"</div>");
    if(copyLogs.children().length>15){
      copyLogs.children().last().remove();
    }

    var _battleId = string.match(/[0-9A-Z]{8}\s:参戦ID/);
    var battleId = _battleId[0].slice(0,8);

    chrome.runtime.sendMessage({text: battleId});
  }
});
