window.onload = function(){
document.getElementById("openApp").onclick = function() {
  chrome.windows.create({
        url: chrome.extension.getURL('dest/html/app.html'), 
              type: 'popup',
              width: 372, 
              height: 10000
  });
};

document.getElementById("openGbf").onclick = function() {
  window.open("http://game.granbluefantasy.jp/#top");
};
}
