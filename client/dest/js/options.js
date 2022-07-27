$(function() {
  var $twitterAuthButton = $("#twitter-auth button"); 

  var $raidsAddTextInput = $("#raids-add input[type=text]");
  var $raidsAddSaveButton = $("#raids-add button");

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
    if($raidsAddTextInput.val()!="")chrome.runtime.sendMessage({"method":"addOtherRaids","bossName":$raidsAddTextInput.val()});
    console.log($raidsAddTextInput.val());
  });
});
