console.log("load : background.js")

function clipboardCopy(str){
  var _battleId = str.match(/[0-9A-Z]{8}\s:参戦ID/);
  var battleId = _battleId[0].slice(0,8);
  var textArea = document.createElement("textarea");
  textArea.style.cssText = "position:absolute;left:-100%";

  document.body.appendChild(textArea);

  textArea.value = battleId;
  textArea.select();
  console.log(str,document.execCommand("copy"));

  chrome.browserAction.setBadgeText({text:String(new Date().getSeconds())});
  document.body.removeChild(textArea);
}

function setBadge(text){
  switch (text){
    case "red":
      chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
      break;
    case "green":
      chrome.browserAction.setBadgeBackgroundColor({ color: [31, 155, 31, 255] });
      break;
  }
}

function jsonRead(path){
  return new Promise((resolve,reject)=>{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.runtime.getURL(path), true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        resolve(xhr.responseText);
      }else if(xhr.readyState == XMLHttpRequest.DONE){
        reject(xhr);
      }
    }
    xhr.send();
  })
}

var raids = {};
var raidsCopyList = localStorage.getItem("raidsCopyList")!==null?JSON.parse(localStorage.getItem("raidsCopyList")):[];
var raidsPath = 'dest/json/raids.json';

jsonRead(raidsPath)
  .then((res)=>{
    raids = JSON.parse(res);
    raids["Other"] = [new Array()];
    console.log(raids)
  })
.catch((err)=>{return console.log("error",err)})

var tokens,config;
var tokensPath = 'tokens.json';
var twitterController;

jsonRead(tokensPath)
  .then((res)=>{
    tokens = JSON.parse(res);
    config = {
      "request_url": "https://api.twitter.com/oauth/request_token",
      "authorize_url": "https://api.twitter.com/oauth/authorize",
      "access_url": "https://api.twitter.com/oauth/access_token",
      "consumer_key": tokens["consumer_key"],
      "consumer_secret": tokens["consumer_secret"]
    }
    if(localStorage.getItem("oauth_tokenundefined")!==null){
       tokens["access_token_key"] = localStorage.getItem("oauth_tokenundefined");
       tokens["access_token_secret"] = localStorage.getItem("oauth_token_secretundefined");    
       twitterController = new twitterConnectionController(tokens); 
    }
  })
.catch((err)=>{return console.log("error",err)})


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var response = {"status":true};
  switch (request.method){
    case "getRunApp":
      response["isRun"]= twitterController.stream!=null;
      break;
    case "toggleRunApp": 
      if(twitterController.stream!=null){
        twitterController.StopStream();
        setBadge("red"); 
        response["isRun"]=false;
      }else{
        twitterController.StartStream(raidsCopyList);
        response["isRun"]=true;
      }
      break;
    case "getCopyList":
      response["list"]=raidsCopyList;
      break;
    case "addCopyList":
      raidsCopyList.push(request.raid);
      localStorage.setItem("raidsCopyList",JSON.stringify(raidsCopyList));
      if(twitterController.stream!=null){
        twitterController.StopStream();
        twitterController.StartStream(raidsCopyList);
      }
      response["list"]=raidsCopyList;
      break;
    case "deleteCopyList":
      raidsCopyList = raidsCopyList.filter((raidName)=>{
        return request.raid !== raidName
      });
      localStorage.setItem("raidsCopyList",JSON.stringify(raidsCopyList)); 
      if(twitterController.stream!=null){
        twitterController.StopStream();
        twitterController.StartStream(raidsCopyList);
      }
      response["list"]=raidsCopyList;
      break;
    case "addOtherRaids":
      raids["Other"][0].push(request.bossName);
      response["raids"]=raids;
      break;
    case "getRaids":
      response["raids"]=raids;
      break;
    case "twitterAuth":
      var oauth = ChromeExOAuth.initBackgroundPage(config);
      oauth.callback_page = 'dest/html/oauthPage.html';
      oauth.authorize((token, secret) => {
        console.log(token, secret);
        tokens["access_token_key"] = token;
        tokens["access_token_secret"] = secret;    
        twitterController = new twitterConnectionController(tokens);
      })
      break;
  }
  console.log(response);
  sendResponse(response);
});

let test = ()=>{
  const Twitter = class {

        constructor(apiKey, apiSecretKey, accessToken, accessTokenSecret) {
            this._apiKey       = apiKey;
            this._apiSecretKey = apiSecretKey;
            this._accessToken       = accessToken;
            this._accessTokenSecret = accessTokenSecret;
        }

        async get(url, params) {

            const query = this._percentEncodeParams(params).map(pair => pair.key + '=' + pair.value).join('&');

            const method = 'GET';

            // 認証情報
            const authorizationHeader = await this._getAuthorizationHeader(method, url, params);

            const headers = {'Authorization': authorizationHeader};

            // 通信
            return fetch((! params ? url : url + '?' + query), {method, headers});

        }

        async _getAuthorizationHeader(method, url, params) {

            // パラメータ準備
            const oauthParams = [
                {key: 'oauth_consumer_key'    , value: this._apiKey        },
                {key: 'oauth_nonce'           , value: this._getNonce()    },
                {key: 'oauth_signature_method', value: 'HMAC-SHA1'         },
                {key: 'oauth_timestamp'       , value: this._getTimestamp()},
                {key: 'oauth_token'           , value: this._accessToken   },
                {key: 'oauth_version'         , value: '1.0'               }
            ];

            const allParams = this._percentEncodeParams([...oauthParams, ...params]);

            this._ksort(allParams);

            // シグネチャ作成
            const signature = await this._getSignature(method, url, allParams);

            // 認証情報
            return 'OAuth ' + this._percentEncodeParams([...oauthParams, {key: 'oauth_signature', value: signature}]).map(pair => pair.key + '="' + pair.value + '"').join(', ');

        }

        async _getSignature(method, url, allParams) {

            const allQuery = allParams.map(pair => pair.key + '=' + pair.value).join('&');

            // シグネチャベース・キー文字列
            const signatureBaseString = [
                method.toUpperCase(),
                this._percentEncode(url),
                this._percentEncode(allQuery)
            ].join('&');

            const signatureKeyString = [
                this._apiSecretKey,
                this._accessTokenSecret
            ].map(secret => this._percentEncode(secret)).join('&');

            // シグネチャベース・キー
            const signatureBase = this._stringToUint8Array(signatureBaseString);
            const signatureKey  = this._stringToUint8Array(signatureKeyString);

            // シグネチャ計算
            const signatureCryptoKey = await window.crypto.subtle.importKey('raw', signatureKey, {name: 'HMAC', hash: {name: 'SHA-1'}}, true, ['sign']);

            const signatureArrayBuffer = await window.crypto.subtle.sign('HMAC', signatureCryptoKey, signatureBase);

            return this._arrayBufferToBase64String(signatureArrayBuffer);

        }

        /**
         * RFC3986 仕様の encodeURIComponent
         */
        _percentEncode(str) {
            return encodeURIComponent(str).replace(/[!'()*]/g, char => '%' + char.charCodeAt().toString(16));
        }

        _percentEncodeParams(params) {

            return params.map(pair => {
                const key   = this._percentEncode(pair.key);
                const value = this._percentEncode(pair.value);
                return {key, value};
            });

        }

        _ksort(params) {

            return params.sort((a, b) => {
                const keyA = a.key;
                const keyB = b.key;
                if ( keyA < keyB ) return -1;
                if ( keyA > keyB ) return 1;
                return 0;
            });

        }

        _getNonce() {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            // メモ: Uint8Array のままだと String に変換できないので、Array に変換してから map
            return [...array].map(uint => uint.toString(16).padStart(2, '0')).join('');
        }

        _getTimestamp() {
            return Math.floor(Date.now() / 1000);
        }

        _stringToUint8Array(str) {
            return Uint8Array.from(Array.from(str).map(char => char.charCodeAt()));
        }

        _arrayBufferToBase64String(arrayBuffer) {

            const string = new Uint8Array(arrayBuffer).reduce((data, char) => {
                data.push(String.fromCharCode(char));
                return data;
            }, []).join('');

            return btoa(string);

        }

    };

    const params = [
        {key: 'track', value: 'vim'}
    ];
    const decoder = new TextDecoder();
    twit = new Twitter(tokens.consumer_key,tokens.consumer_secret,tokens.access_token_key,tokens.access_token_secret);
    twit.get("https://stream.twitter.com/1.1/statuses/filter.json",params)
    .then((response) => response.body.getReader()) // ReadableStreamを取得する。
    .then((reader) => {
      function readChunk({done, value}) {
        if(done) {
            console.log("done");
            return;
        }
        console.log(decoder.decode(value));

        // 次の値を読みにいく。
        reader.read().then(readChunk);
      }
      reader.read().then(readChunk);
    
    });


}

