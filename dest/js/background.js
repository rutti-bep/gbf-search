console.log("!!!");

const twitterToken = {
  "consumer_key":"DB7Fo4mQh2oKEGlTmH5LRAtGQ",
  "consumer_secret":"MbOLda86zlX4XIh5EbJJdum93cVK8j2Cg2Qps4UQ8Z9Bq4bziN",
  "access_token_key":"715302500379693056-6iD7svP3K38Ht55bS6ZxIjl4gY7r2UH",
  "access_token_secret":"P5Brj4NUFrvpu8TPgZGqur6gH3WRYgtaJMH5mTyeuB4O71",

}

const auth = {
  "oauth_consumer_key":twitterToken["consumer_key"],
  "oauth_nonce":"hoge",
  "oauth_signature_method":"HMAC-SHA1",
  "oauth_timestamp":String(Math.floor((new Date())/1000)),
  "oauth_token":twitterToken["access_token_key"],
  "oauth_version":'1.0'
}

const uri_encode = function(text){
    return encodeURIComponent(text).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
};

const generateSignature = function(method, uri, params, oauth_secret){
  var key_array = [], key, i, l, base_string, sorted_params;

  base_string = method.toUpperCase() + '&' + uri_encode(uri) + '&';

  for(key in params){
    if(params.hasOwnProperty(key)){
      key_array[key_array.length] = key;
    }
  }
  key_array.sort();
  l = key_array.length;

  sorted_params = [];
  for(i=0;i<l;i++){
    sorted_params[sorted_params.length] = (key_array[i] + '=' + uri_encode(params[key_array[i]]));
  }
  base_string += uri_encode(sorted_params.join('&'));
  console.log(base_string);

  if(!oauth_secret){
    oauth_secret = '';
  }

  var shaObj = new jsSHA(base_string, 'TEXT');
  var secret_key = this.consumer_secret + '&' + oauth_secret;
  console.log(secret_key)

  return uri_encode(shaObj.getHMAC(secret_key, 'TEXT', 'SHA-1', 'B64'));
}

console.log(generateSignature("POST","https://stream.twitter.com/1.1/statuses/filter.json?track=%E5%8F%82%E5%8A%A0%E8%80%85%E5%8B%9F%E9%9B%86%EF%BC%81",auth,twitterToken))

//const auth = 'OAuth oauth_consumer_key="DB7Fo4mQh2oKEGlTmH5LRAtGQ",oauth_nonce="b9980662fe9441e59bdc59a915f598a2",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1586452212",oauth_token="715302500379693056-6iD7svP3K38Ht55bS6ZxIjl4gY7r2UH",oauth_version="1.0",oauth_signature="ZPdbLHjsDY6EdohcmoDTXOjZUIc%3D"'
var xhr = new XMLHttpRequest();

xhr.open("POST", "https://stream.twitter.com/1.1/statuses/filter.json?track=%E5%8F%82%E5%8A%A0%E8%80%85%E5%8B%9F%E9%9B%86%EF%BC%81", true);
xhr.setRequestHeader('Authorization', auth);
xhr.addEventListener('load', function() {
    console.log(xhr.responseText);
});
xhr.send();
