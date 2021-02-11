$(function() {
  var appToggle = $("#appToggle");
  var copyLogs = $("#copyLogs");

  chrome.runtime.sendMessage({"method":"getRunApp"},(res)=>{
    appToggle.prop('checked', res["isRun"]);
    console.log(res)
  }); 

  appToggle.click(()=>{
    appToggle.prop("checked");
    chrome.runtime.sendMessage({"method":"toggleRunApp"}); 
  });


  $("input[name=raidsListToggles]:radio").change(function(){
    var val = $(this).data("level")
    $(".raidsLists").css("display","none")
      $("#raidsList"+val).slideDown();
    console.log(val)
  });

  if(localStorage.getItem("oauth_tokenundefined")!==null){
    $("#version-message").remove();
  }

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
});
