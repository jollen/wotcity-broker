var http = require("http");
var url = require("url");

var WebSocketServer = require('websocket').server;
var WebSocketRouter = require('websocket').router;

// Connected WebSocket clients
var clients = [];

function start(route, handlers) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;

    console.log("HTTP Request: " + pathname);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  var server = http.createServer(onRequest).listen(8080, function() {
     console.log("Server has started and is listening on port 8080.");
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  function push(data) {
    for (var i = 0; i < clients.length; i++) {
        clients[i].sendUTF(data);
    }

    ////// Dump ////////
    var json = JSON.parse(data);
    console.log(json.ax + ','
		+ json.ay + ','
		+ json.az);
  }

  function onWsConnMessage(message) {
    if (message.type == 'utf8') {
      push(message.utf8Data);
      //console.log('Received: ' + message.utf8Data);
    } else if (message.type == 'binary') {
      console.log('Received binary data.');
    }
  }

  function onWsConnClose(reasonCode, description) {
    console.log('Peer disconnected with reason: ' + reasonCode);
  }

  function onWsRequest(request) {
    var connection = request.accept('', request.origin);
    console.log("[2]: onWsRequest");

    console.log("[3]: resource: " + request.resource);

    route(request.resource, connection, handlers, clients);

    connection.on('message', onWsConnMessage);
    connection.on('close', onWsConnClose);
  }

  function onWsConnect(webSocketConnection) {
    console.log("[1]: onWsConnect");

    webSocketConnection.on('message', onWsConnMessage);
    webSocketConnection.on('close', onWsConnClose);
  }

  wsServer.on('request', onWsRequest);
  wsServer.on('connect', onWsConnect);
}

// Export functions
exports.start = start;
