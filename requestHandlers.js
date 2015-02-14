function send(pathname, connection, clients) {
    console.log("Routed: " + pathname);
}

function viewer(pathname, connection, clients) {
    console.log("Routed: " + pathname);

    // Save clients (unlimited clients)
    clients.push(connection);
}

exports.send = send;
exports.viewer = viewer;