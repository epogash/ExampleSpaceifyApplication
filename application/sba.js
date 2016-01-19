// Spaceify core modules are in /api/ directory. Fibrous is a module for synchronous function calls.
var fibrous = require("fibrous");
var Config = require("/api/config")();
var WebSocketRPCServer = require("/api/websocketrpcserver");
var WebSocketRPCClient = require("/api/websocketrpcclient");

function ExampleSBA1()
{
  var self = this;
  var rpcCore = new WebSocketRPCClient();
  var rpcServer = new WebSocketRPCServer();

  self.start = fibrous( function()
  {
    try
    {
      // Open a connection to the Spaceify core.
      rpcCore.sync.connect({hostname: Config.EDGE_HOSTNAME, port: Config.CORE_PORT_WEBSOCKET, persistent: true});

      // Create WebSocket JSON-RPC server for this spacelet.
      rpcServer.connect.sync({hostname: null, port: Config.FIRST_SERVICE_PORT});

      // Expose a method for external calls.
      rpcServer.exposeMethod("getCurrentDateTime", self, self.getCurrentDateTime);

      // Register the provided service to the Spaceify core.
      rpcCore.sync.call("registerService", ["spaceify.org/services/example/sba1"], self);

      // Notify Spaceify core application was succesfully initialized.
      rpcCore.sync.call("initialized", [true, null], self);
    }
    catch(err)
    {
      // Notify Spaceify Core application failed to initialize itself. The error message can be passed to the Core.
      rpcCore.sync.call("initialized", [false, err.message], self);
      self.sync.stop();
    }
    finally
    {
      rpcCore.sync.close();
    }
  });

  // Close the server.
  self.stop = fibrous( function()
  {
    rpcServer.sync.close();
  });

  // Implement the exposed method.
  self.getCurrentDateTime = fibrous( function()
  {
    var date = new Date();
    date = date.getFullYear() + "-" +
    ("00" + (date.getMonth()+1)).slice(-2) + "-" +
    ("00" + date.getDate()).slice(-2) + " " +
    ("00" + date.getHours()).slice(-2) + ":" +
    ("00" + date.getMinutes()).slice(-2) + ":" +
    ("00" + date.getSeconds()).slice(-2);

    return date;
  });
  
}

// Start the application.
fibrous.run(function()
{
  var example = new ExampleSBA1();
  example.sync.start();
});
