$(function() {
  var $twitterAuthButton = $("#twitter-auth button"); 

  var $raidsAddTextInput = $("#raids-add input[type=text]");
  var $raidsAddSaveButton = $("#raids-add button");

  var $raidsOtherList = $("#raids-otherlist");

  if(localStorage.getItem("oauth_tokenundefined")!==null){
    $twitterAuthButton.prop('disabled',true);
  }else{
    $twitterAuthButton.on("click",()=>{
      if(localStorage.getItem("oauth_tokenundefined")!==null){
        alert("すでに認証されました!");
      }else{
        chrome.runtime.sendMessage({"method":"twitterAuth"});
      }
    });
  }

  $raidsAddSaveButton.on("click",()=>{
    if($raidsAddTextInput.val()!=""){
      SendMessage({"method":"addOtherRaids","bossName":$raidsAddTextInput.val()})
      .then(()=>{
        OtherListUpd();
      })
    }
  });


  const OtherListUpd = ()=>{
    var list = localStorage.getItem("raidsOtherList")!==null?JSON.parse(localStorage.getItem("raidsOtherList")):[];
      $raidsOtherList.empty();
      list.forEach((raidName)=>{
        var $raidSpan = $("<li></li>");
        const $raidNameInput = $("<input></input>",{
            type: "text",
            value: raidName
        })
        const $raidNameSubmit = $("<input></input>",{
            type: "button",
            value: "更新",
            on:{
                click:()=>{
                  SendMessage({"method":"fixOtherRaids","oldBossName":raidName,"newBossName":$raidNameInput[0].value})
                  .then(()=>{
                    console.log($raidNameInput[0].value,raidName)
                    OtherListUpd();
                  })
                }
            }
        })
        $raidSpan.append($raidNameInput);
        $raidSpan.append($raidNameSubmit)
        $raidsOtherList.append($raidSpan);
      });
  }

  const SendMessage = (payLoad)=>{
    return new Promise((resolve)=>{
      chrome.runtime.sendMessage(payLoad, function(response) {
        resolve(response)
      });
    })
  }
  
  OtherListUpd();//初期化
});
