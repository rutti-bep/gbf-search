$(function() {
  var socket = io.connect("https://obscure-forest-66282.herokuapp.com/");
  socket.on('msg', function(data) {
    console.log(data);
    var clipboard = new Clipboard('');
  });
});
