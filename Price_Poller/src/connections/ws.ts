import WebSocket from "ws";

const ws = new WebSocket(
  process.env.BINANCE_WS_URL || "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade"
);

ws.on("open", () => {
  console.log("Connected to Binance WebSocket");
});

export { ws };