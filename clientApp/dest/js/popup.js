$(function() {
  var appToggle = $("#appToggle");
  var raidsListToggles = $(".raidsListToggles");
  var copyLogs = $("#copyLogs");
  

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
  var raidsCopyList = [];
  var getRaids = new Promise((resolve,reject)=>{
      chrome.runtime.sendMessage({"method":"getRaids"},(res)=>{
        raids = res.raids;
        resolve()
      })
  });
  var getCopyList = new Promise((resolve,reject)=>{
      chrome.runtime.sendMessage({"method":"getCopyList"},(res)=>{
        raidsCopyList = res.list;
        resolve()
      })
  });
  Promise.all([getRaids,getCopyList])
    .then(function(){
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
    });


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    switch (request.method){
      case "raidsAdd":
        raids["Other"][0].push(request.raid);
        console.log(raids["Other"][0]);
        raidsOtherSort();
        raidsOtherListUpdate();
        break;
    }
});

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
              chrome.runtime.sendMessage({"method":"addCopyList","raid":raid});
            }else{
              chrome.runtime.sendMessage({"method":"deleteCopyList","raid":raid});
            }
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
