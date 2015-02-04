var http = require("http");
var url = require("url");
var WebSocketServer = require('websocket').server;

// Connected WebSocket clients
var clients = [];

function start(route, handlers) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;

    console.log("Request for " + pathname + " received.");

    route(pathname, handlers, response, query, clients);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  var server = http.createServer(onRequest).listen(8080, function() {
     console.log("Server has started and is listening on port 8080.");
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true
  });

  function onWsConnMessage(message) {
    if (message.type == 'utf8') {
        for (var i = 0; i < clients.length; i++) {
            clients[i].sendUTF(message.data);
        }
    } else if (message.type == 'binary') {
      console.log('Received binary data.');
    }
  }

  function onWsConnClose(reasonCode, description) {
    console.log('Peer disconnected with reason: ' + reasonCode);
  }

  function onWsRequest(request) {
    var connection = request.accept('mbed-taiwan', request.origin);
    console.log("WebSocket connection accepted.");

    // Save clients (unlimited clients)
    clients.push(connection);

    connection.on('message', onWsConnMessage);
    connection.on('close', onWsConnClose);
  }

  function onWsConnect(webSocketConnection) {
    console.log("WebSocket connection accepted.");

    // Save clients (unlimited clients)
    clients.push(webSocketConnection);

    webSocketConnection.on('message', onWsConnMessage);
    webSocketConnection.on('close', onWsConnClose);
  }

  wsServer.on('request', onWsRequest);
  wsServer.on('connect', onWsConnect);
}

// Export functions
exports.start = start;
