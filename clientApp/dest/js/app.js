$(function() {
  var socket = io.connect("https://obscure-forest-66282.herokuapp.com/");
  var raidsList = document.getElementById("raidsList");
  var clipboardElm = document.getElementById("clipboard");
  var count=0;

  socket.on('msg', function(data) {
    count++
    console.log(data);
    if(count > 30){
       count=0;
       execCopy(data);
    }
  });
  
  function execCopy(string){
    var pre = document.createElement('pre');

    raidsList.appendChild(pre).textContent = string;

    chrome.runtime.sendMessage({text: string});
  }
});

