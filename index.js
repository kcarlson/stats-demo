const fs = require("fs");
const express = require("express");
const ws = require("ws");

// Get host and port from environment variables or default to 0.0.0.0:3001
const port = process.env.PORT || 3001;
const host = process.env.HOST || "0.0.0.0";
// Get stats connector from environment variable or default to dummy connector
const connector = process.env.STATS_CONNECTOR || "dummy";

// Check if connector exists
if (fs.existsSync(`./connectors/${connector}.js`) === false) {
  console.error(`Connector ${connector} does not exist.`);
  process.exit(1);
}

// Load connector
const statsAdapter = require(`./connectors/${connector}.js`)();

const app = express();
// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Replace '*' with the appropriate domain if needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.get("/stats-demo-server/v1", (req, res) => {
  res.json(statsAdapter.getStats());
});
// Handle post with json body
app.post("/stats-demo-server/v1", (req, res) => {
  req.on("data", (data) => {
    const exists = statsAdapter.addStats(JSON.parse(data)) === false;
    res.statusCode = exists ? 409 : 200;
  });
  // Wait until the end of the request to send the response
  req.on("end", () => {
    // Only send body if status code is 200
    if (res.statusCode === 200) {
      res.json(statsAdapter.getStats());
      return;
    }

    res.end();
  });
});
app.delete("/stats-demo-server/v1/:name", (req, res) => {
  const exists =
    statsAdapter.removeStats({ stats: [{ name: req.params.name }] }) === false;
  res.statusCode = exists ? 404 : 200;
  res.end();
});

const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket) => {
  socket.on("message", (message) => console.log(message));
});

const server = app.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
    console.log("Websocket connection established");
    statsAdapter.emitter.on("stats", (stats) => {
      socket.send(JSON.stringify(stats));
    });
  });
  // Log close
  socket.on("close", () => {
    console.log("Websocket connection closed");
    statsAdapter.emitter.removeAllListeners("stats");
  });
});

console.log(`Using ${connector} stats adapter.`);

// Capture sigterm or sigint for graceful shutdown from docker
const closeServer = () => {
  console.log("Closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    console.log("Closing WS server");
    wsServer.close(() => {
      console.log("WS server closed");
      process.exit(0);
    });
  });
};
process.on("SIGTERM", closeServer);
process.on("SIGINT", closeServer);
