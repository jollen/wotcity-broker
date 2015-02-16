var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket client connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });

    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            // 1 to 10
            var lucky = Math.round(Math.random() * 10 + 1);
            //var obj = {ax: number.toString(), ay: 0, az: 0};
            var obj = {random: number};

            console.log('Pushing: ' + JSON.stringify(obj));

            connection.sendUTF(JSON.stringify(obj));
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
});

client.connect('ws://wot.city/object/test/send', '');
