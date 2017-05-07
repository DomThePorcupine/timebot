/*
  Entry point of the nodejs app

  This code was written by @groupme and has been
  slightly modified to fit my specific purposes
*/
var router, server, port;
var time = require('time');
var http = require('http');
var director = require('director');

var bot = require('./bot.js');

router = new director.http.Router({
  '/' : {
    post: bot.respond
  }
});

server = http.createServer(function (req, res) {
  req.chunks = [];
  req.on('data', function (chunk) {
    req.chunks.push(chunk.toString());
  });

  router.dispatch(req, res, function(err) {
    res.writeHead(err.status, {"Content-Type": "text/plain"});
    res.end(err.message);
  });
});

port = Number(process.env.PORT || 5000)
server.listen(port)

