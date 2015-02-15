var http = require("http");
var url = require("url");

var WebSocketServer = require('websocket').server;

// Connected WebSocket clients
var clients = [];

function start(route, handlers) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;

    //console.log("HTTP Request: " + pathname);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  var server = http.createServer(onRequest).listen(80, function() {
     console.log("Server has started and is listening on port 80.");
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  var push = function(path, data) {
    var connections = clients[path];

    if (typeof connections === 'undefined')
        return;

    console.log('Pushing [' + data + '] to ' + path);

    for (var i = 0; i < connections.length; i++) {
        connections[i].sendUTF(data);
    }
  }

  var onWsConnMessage = function(message) {
    if (message.type == 'utf8') {
      //console.log('onWsConnMessage: ' + this.pathname);
      //console.log('Received: ' + message.utf8Data);

      // Is it a sender ? Yes, then push data to all viewers.
      if (typeof (this.viewer) !== 'undefined')
          push(this.viewer, message.utf8Data);
    } else if (message.type == 'binary') {
      console.log('Received binary data.');
    }
  };

  var onWsConnClose = function(reasonCode, description) {
    //console.log('Peer disconnected with reason: ' + reasonCode);
  };

  function onWsRequest(request) {
    var connection = request.accept('', request.origin);

    //console.log("[2]: onWsRequest");
    //console.log("[3]: resource: " + request.resource);

    route(request.resource, connection, handlers, clients);

    connection.on('message', onWsConnMessage);
    connection.on('close', onWsConnClose);
  }

  function onWsConnect(webSocketConnection) {
    //console.log("[1]: onWsConnect");

    //webSocketConnection.on('message', onWsConnMessage);
    //webSocketConnection.on('close', onWsConnClose);
  }

  wsServer.on('request', onWsRequest);
  wsServer.on('connect', onWsConnect);
}

// Export functions
exports.start = start;
