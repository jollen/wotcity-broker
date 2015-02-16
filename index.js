var server = require("./server");
var router = require("./router");
var handlers = require("./requestHandlers");

// 使用 Object 來對應 pathname 與 request handlers
var wsHandlers = {
   "/object/([A-Za-z0-9-]+)/send": handlers.send,
   "/object/([A-Za-z0-9-]+)/viewer": handlers.viewer
};

// 傳遞 request handler 
server.start(router.route, wsHandlers);
