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
