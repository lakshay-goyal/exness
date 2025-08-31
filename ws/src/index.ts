import {subscriber} from './connect/pubsub.js'
import {wss} from './connect/ws.js'

wss.on("connection", async (socket) => {
  console.log("Client connected");

  // Subscribe once a client connects
  await subscriber.subscribe("binance:pubsub", (message) => {
    const data = JSON.parse(message);

    // Send to this client
    socket.send(JSON.stringify(data));
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});
