const fs = require("fs");
const express = require("express");
const ws = require("ws");

// Get host and port from environment variables or default to localhost:3001
const port = process.env.PORT || 3001;
const host = process.env.HOST || "localhost";
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

const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket) => {
  socket.on("message", (message) => console.log(message));
});

const server = app.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});

server.on("upgrade", (request, socket, head) => {
  console.log("upgrade");
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    console.log("handleUpgrade");
    wsServer.emit("connection", socket, request);
    setInterval(() => {
      socket.send("Hello from the server!");
    }, 1000);
  });
});

console.log(`Using ${connector} stats adapter.`);
