/*!
 * WoT.City
 * Copyright(c) 2015 Mokoversity Inc.
 * Copyright(c) 2015 Jollen Chen
 * MIT Licensed
 */

 /**
 * Module dependencies.
 */
var WebsocketBroker = require("./server")
  , router = require("./router")
  , handlers = require("./requestHandlers")
  , merge = require('utils-merge');

/**
 * Websocket URL Router
 */
var wsHandlers = {
   "/object/([A-Za-z0-9-]+)/send": handlers.send,
   "/object/([A-Za-z0-9-]+)/viewer": handlers.viewer,
   "/object/([A-Za-z0-9-]+)/status": handlers.status
};

/*
 * Prototype and Class
 */
var Application = {};

/**
 * Start a Websocket server.
 *
 * @return {None}
 * @api public
 */
Application.start = function() {
  var server = new WebsocketBroker();
  server.start(router.route, wsHandlers);
};

/**
 * Create an WoT application.
 *
 * @return {Function}
 * @api public
 */
function createApplication(options) {
  return merge(Application, options);
}

/**
 * Expose `createApplication()`.
 */
exports = module.exports = createApplication;
