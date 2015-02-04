var querystring = require('querystring'); 

/**
 * Global variables
 */
var history = [ ];

function start(response, query, clients) {
    console.log("Handler 'start' is started.");
    console.log("Query string is: " + query);
}

function send(response, query, clients) {
    console.log("Handler 'send' is started.");
    console.log("Query string is: " + query);

    var parsedstring = querystring.parse(query); 

    // 100 to 500
    var temp = Math.floor((Math.random() * 400) + 100);

    // 0 to 0.01
    var lowpulseoccupancytime = Math.random() / 10;

    var obj = {
        message: parsedstring.m,
        username: parsedstring.u,
        timestamp: (new Date()).getTime(),

        temp: temp,
        lowpulseoccupancytime: lowpulseoccupancytime
    };

    history.push(obj);

    //////// DEBUG ////////
    console.log(obj);

    var json = JSON.stringify(obj);

    // Data push to all clients
    for (var i = 0; i < clients.length; i++) {
      	clients[i].sendUTF(json);
    }
}

exports.start = start;
exports.send = send;
