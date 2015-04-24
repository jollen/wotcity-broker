var wotcity = require('./lib/wotcity');

/**
 * Create a WoT application instance.
 */
var app = new wotcity();

/**
 * Start the Websocket broker server.
 */
app.start();
