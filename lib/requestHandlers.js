function send(pathname, connection, clients) {
    console.log("Routed: " + pathname + ' at worker [' + connection.worker.id + ']');

    // the original sender pathname
    connection.pathname = pathname;

    /*
     * convert sender pathname to viewer pathname
     * eg. '/object/mbedtaiwan/send' to '/object/mbedtaiwan/viewer'
     */
    var paths = pathname.split('/');

    // remove the rear string 'send'
    var viewer = paths.slice(0, -1).join('/');

    connection.viewer = viewer + '/viewer';
    connection.statusViewer = viewer + '/status';

    /*
     * initial storage for this viewer
     */
    for (var path in clients) {
        if (path === connection.viewer)
            return;
    }

    clients[connection.viewer] = [];
    clients[connection.statusViewer] = [];
}

function viewer(pathname, connection, clients) {
    console.log("Viewer Routed: " + pathname);

    // the original sender pathname
    connection.pathname = pathname;

    // Save viewer clients (unlimited clients)
    for (var path in clients) {
        if (path === pathname) {
            clients[path].push(connection);
            return;
        }
    }

    /*
     * Not found. There is not a existing sender.
     */
    clients[pathname] = [];
    clients[pathname].push(connection);
}

function status(pathname, connection, clients) {
    console.log("Status Routed: " + pathname);

    // the original sender pathname
    connection.pathname = pathname;

    // Save status viewer clients (unlimited clients)
    for (var path in clients) {
        if (path === pathname) {
            clients[path].push(connection);
            return;
        }
    }

    /*
     * Not found. There is not a existing status viewer.
     */
    clients[pathname] = [];
    clients[pathname].push(connection);
}

exports.send = send;
exports.viewer = viewer;
exports.status = status;