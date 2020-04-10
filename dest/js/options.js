$(function() {
  var $raidsAddTextInput = $("#raids-add input[type=text]");
  var $raidsAddSaveButton = $("#raids-add button");

  $raidsAddSaveButton.on("click",()=>{
    if($raidsAddTextInput.val()!="")chrome.runtime.sendMessage({"method":"addOtherRaids","bossName":$raidsAddTextInput.val()});
    console.log($raidsAddTextInput.val());
  });
});
