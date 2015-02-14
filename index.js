var server = require("./server");
var router = require("./router");
var handlers = require("./requestHandlers");

// 使用 Object 來對應 pathname 與 request handlers
var wsHandlers = {
   "/ws/([A-Za-z-]+)/send": handlers.send,
   "/ws/([A-Za-z-]+)/viewer": handlers.viewer
};

// 傳遞 request handler 
server.start(router.route, wsHandlers);