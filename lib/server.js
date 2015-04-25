
/**
 * Module dependencies.
 */

var http = require("http")
  , url = require("url")
  , cluster = require('cluster')
  , WebSocketServer = require('websocket').server;

/**
 * Expose `WebsocketBroker` constructor.
 */

exports = module.exports = WebsocketBroker;

/**
 * Initialize a new `WebsocketBroker` with the given `options`.
 *
 * @param {Object} options
 * @api private
 */

function WebsocketBroker(options) {
  options = options || {};
  this.clientsPath = [];
  this.host = options.host ? options.host : 'localhost';
  this.port = options.port ? options.port : 8000;
}

WebsocketBroker.prototype.onRequest = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end();
};

WebsocketBroker.prototype.push = function(path, data) {
  var connections = this.clientsPath[path];

  if (typeof connections === 'undefined')
    return;

  //console.log('Pushing [' + data + '] to ' + path);

  for (var i = 0; i < connections.length; i++) {
    connections[i].sendUTF(data);
  }
};

WebsocketBroker.prototype.pushStatus = function(path, data) {
  var connections = this.clientsPath[path];

  if (typeof connections === 'undefined')
    return;

  //console.log('Pushing [' + data + '] to ' + path);

  for (var i = 0; i < connections.length; i++) {
    connections[i].sendUTF(data);
  }
};

/**
 * Start websocket server.
 *
 * @param {Object} route
 * @return {}
 * @api public
 */

WebsocketBroker.prototype.start = function(route, handlers) {
  var self = this;

  if (cluster.isMaster) {
      // Count the machine's CPUs
      var cpuCount = require('os').cpus().length;

      //console.info('CPUs: ' + cpuCount);

      // Create a worker on each CPU
      for (var i = 0; i < cpuCount ; i++) {
          var port = this.port + i;
          cluster.fork({
            HOST: this.host,
            PORT: port
          });
      }

      return true;
  }

  // arguments to child processes
  var port = process.env['PORT'];
  var host = process.env['HOST'];

  var server = http.createServer(this.onRequest).listen(port, host, function() {
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

    route(request.resource, connection, handlers, self.clientsPath);

    connection.on('message', onWsConnMessage);
    connection.on('close', onWsConnClose);

    if (typeof (connection.statusViewer) !== 'undefined')
      self.pushStatus(connection.statusViewer, JSON.stringify({ isAlive: true }));
  };



  var onWsConnMessage = function(message) {
    //console.log('onWsConnMessage: ' + this.pathname);
    //console.log('Received: ' + message.utf8Data);

    // Is it a sender ? Yes, then push data to all viewers.
    if (typeof (this.viewer) !== 'undefined')
      self.push(this.viewer, message.utf8Data);

    if (typeof (this.statusViewer) !== 'undefined')
      self.pushStatus(this.statusViewer, JSON.stringify({ isAlive: true }));
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
        self.pushStatus(this.statusViewer, JSON.stringify({ isAlive: false }));
  };

  wsServer.on('request', onWsRequest);
  wsServer.on('connect', onWsConnect);
};