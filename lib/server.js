var http = require("http");
var url = require("url");
var cluster = require('cluster');

var WebSocketServer = require('websocket').server;

// Connected WebSocket clients by pathname
var clientsPath = [];

function start(route, handlers) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;

    //console.log("HTTP Request: " + pathname);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  if (cluster.isMaster) {

      // Count the machine's CPUs
      var cpuCount = require('os').cpus().length;
      var addresses = [];
      var DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

      console.info('CPUs: ' + cpuCount);

      // Create a worker for each CPU
      var i;
      for (i = 0; i < cpuCount ; i++) {
          var port = DEFAULT_PORT + i;
          cluster.fork({PORT: port});
          addresses.push({
              host: '127.0.0.1',
              port: port
          });
      }

      return true;
  }

  // arguments to child processes
  var port = process.env['PORT'];

  var server = http.createServer(onRequest).listen(port, '127.0.0.1', function() {
      var workerinfo = "";
      if (cluster.isWorker) workerinfo = ", on worker " + cluster.worker.id;
      console.info('WoT.City server listening on port ' + port + workerinfo);
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  /**
   * handlers
   */
  var onWsRequest = function(request) {
    var connection = request.accept('', request.origin);

    //console.log("[2]: onWsRequest");
    //console.log("[3]: resource: " + request.resource);

    // put worker object into connection
    connection.worker = cluster.worker;

    route(request.resource, connection, handlers, clientsPath);

    connection.on('message', onWsConnMessage);
    connection.on('close', onWsConnClose);

    if (typeof (connection.statusViewer) !== 'undefined')
      pushStatus(connection.statusViewer, JSON.stringify({ isAlive: true }));
  };

  var push = function(path, data) {
    var connections = clientsPath[path];

    if (typeof connections === 'undefined')
        return;

    //console.log('Pushing [' + data + '] to ' + path);

    for (var i = 0; i < connections.length; i++) {
        connections[i].sendUTF(data);
    }
  };

  var pushStatus = function(path, data) {
    var connections = clientsPath[path];

    if (typeof connections === 'undefined')
        return;

    //console.log('Pushing [' + data + '] to ' + path);

    for (var i = 0; i < connections.length; i++) {
        connections[i].sendUTF(data);
    }
  };

  var onWsConnMessage = function(message) {
    //console.log('onWsConnMessage: ' + this.pathname);
    //console.log('Received: ' + message.utf8Data);

    // Is it a sender ? Yes, then push data to all viewers.
    if (typeof (this.viewer) !== 'undefined')
      push(this.viewer, message.utf8Data);

    if (typeof (this.statusViewer) !== 'undefined')
      pushStatus(this.statusViewer, JSON.stringify({ isAlive: true }));
  };

  var onWsConnect = function(webSocketConnection) {
    //console.log("[1]: onWsConnect");

    //webSocketConnection.on('message', onWsConnMessage);
    //webSocketConnection.on('close', onWsConnClose);
  };

  var onWsConnClose = function(reasonCode, description) {
    //console.log('Peer disconnected with reason: ' + reasonCode);

    // remove an element from Array
    //clientsConn.splice( clientsConn.indexOf(this), 1 );

    if (typeof (this.statusViewer) !== 'undefined')
        pushStatus(this.statusViewer, JSON.stringify({ isAlive: false }));
  };

  wsServer.on('request', onWsRequest);
  wsServer.on('connect', onWsConnect);
};

// Export functions
exports.start = start;
