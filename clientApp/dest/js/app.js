$(function() {
  var appToggle = $("#appToggle");
  var raidsListToggles = $(".raidsListToggles");
  var copyLogs = $("#copyLogs");
  
  var socket = io.connect("https://obscure-forest-66282.herokuapp.com/");
  socket.on('msg', function(data) {
    //console.log(data);
    if(isCopyRaid(data)){      
      execRaidCopy(data);
    }
  });


  chrome.runtime.sendMessage({"method":"getRunApp"},(res)=>{
    appToggle.prop('checked', res["isRun"]);
    console.log(res)
  }); 
  
  appToggle.click(()=>{
    appToggle.prop("checked");
    chrome.runtime.sendMessage({"method":"toggleRunApp"}); 
  });

  raidsListToggles.each((i,toggleElm)=>{
    $(toggleElm).click(()=>{
      $(toggleElm).prop("checked");
      $("#raidsList"+$(toggleElm).data("level")).slideToggle();
    });
  });
  
  //raids情報取得
  var raids = {}
  var file = 'dest/json/raids.json';
  var raidsCopyList = localStorage.getItem("raidsCopyList")!==null?JSON.parse(localStorage.getItem("raidsCopyList")):[];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.runtime.getURL(file), true);
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
      raids = JSON.parse(xhr.responseText);
      raids["Other"] = [new Array()];
      Object.keys(raids).forEach(function(level) {
          var $level = $("#raidsList"+level);
          console.log($level)
          Object.keys(raids[level]).forEach(function(stars) {
              $star = $("<ol></ol>");
              $level.append($star);
              raids[level][stars].forEach((raidName)=>{
                var $raidSpan = $("<li></li>");
                let $raidToggleButton = $('<input></input>',{
                  type: "checkbox",
                  checked: raidsCopyList.includes(raidName),
                  //css: {float:"left"},
                  on: {
                    click:()=> { 
                      var isCopy = $raidToggleButton.prop("checked");
                      if(isCopy){
                        chrome.runtime.sendMessage({"method":"addCopyList","raid":raidName});
                      }else{
                        chrome.runtime.sendMessage({"method":"deleteCopyList","raid":raidName});
                      }
                      console.log(raidsCopyList)
                    }
                  }
                });
                let $raidNameLabel = $('<div></div>',{
                  text:raidName,
                  css: {"display": "inline"}
                });
                $raidSpan.append($raidToggleButton);
                $raidSpan.append($raidNameLabel);
                $star.append($raidSpan);
              });
          });
      });
    }
  };
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
      raidsOtherListUpdate();
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

  function raidsOtherListUpdate(){
    $List = $("#raidsListOther");
    $List.empty();
    $listOrderedList = $("<ol></ol>")
    raids["Other"][0].forEach((raid,index)=>{
      var $raidSpan = $("<li></li>");
      let $raidToggleButton = $('<input></input>',{
        type: "checkbox",
        checked: raidsCopyList.includes(raid),
        //css: {float:"left"},
        on: {
          click:()=> { 
            var isCopy = $raidToggleButton.prop("checked");
            if(isCopy){
              raidsCopyList.push(raid)
            }else{
              raidsCopyList = raidsCopyList.filter((raidName)=>{
                return raidName !== raid
              })
            }
            localStorage.setItem("raidsCopyList",JSON.stringify(raidsCopyList));
            console.log(raidsCopyList)
          }
        }
      });
      let $raidNameLabel = $('<div></div>',{
        text:raid,
        css: {"display": "inline"}
      });
      $raidSpan.append($raidToggleButton);
      $raidSpan.append($raidNameLabel);
      $listOrderedList.append($raidSpan);
    })
    $List.append($listOrderedList)
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
