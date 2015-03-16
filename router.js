var pathToRegExp = function(path) {
    if (typeof(path) === 'string') {
        if (path === '*') {
            path = /^.*$/;
        }
        else {
            //path = path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            path = new RegExp('^' + path + '$');
        }
    }
    return path;
};

// 支援 websocket URL routing
function route(pathname, connection, wsHandlers, clients) {
    //console.log("Route this request: '" + pathname + "'");

    for(var path in wsHandlers) {
      var handler = wsHandlers[path];
      var pathExp = pathToRegExp(path);

      if (!(pathExp instanceof RegExp)) {
        throw new Error('Path must be specified as either a string or a RegExp.');
      }

      if (typeof handler === "function") {
        if (pathExp.test(pathname)) {
          wsHandlers[path](pathname, connection, clients);
        }
      } else {
        console.log("No request handler for this pathname: '" + pathname + "'");
      }
    }
}

exports.route = route;
