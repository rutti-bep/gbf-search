function saveToClipboard(str) {
  var textArea = document.createElement("textarea");
  textArea.style.cssText = "position:absolute;left:-100%";

  document.body.appendChild(textArea);

  textArea.value = str;
  textArea.select();
  console.log(str,document.execCommand("copy"));

  document.body.removeChild(textArea);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      saveToClipboard(request.text);
    });

var config = {};

{
  var file = 'dest/json/raids.json';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.runtime.getURL(file), true);
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
      config = JSON.parse(xhr.responseText);
      console.log(config)
    }
      for (key in config) {
        if (typeof config[key] === 'string' && config[key] != '') {
          console.log('key=' + key + ', value=' + config[key]);
        }
      }
  };
  xhr.send();
}

