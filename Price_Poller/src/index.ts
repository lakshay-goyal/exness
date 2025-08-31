import { redisClient } from "./connections/redis.js";
import { ws } from "./connections/ws.js";
import dotenv from "dotenv";
dotenv.config();


// Track latest bid/ask per symbol
const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
let bidAskMap: Record<string, { bid: number; ask: number }> = {};

ws.on("message", async (data) => {
  try {
    const msg = JSON.parse(data.toString());

    // 3. Push to Redis queue (using a list)
    await redisClient.rPush("binance:trades", JSON.stringify(msg));
    console.log("Message pushed to Redis queue:", msg.data?.s, msg.data?.p);

    // 4. Compute bid/ask
    const symbol = msg.data?.s;
    if (!symbols.includes(symbol)) return;
    const price = parseFloat(msg.data?.p);
    const BidAsk = {
      symbol,
      bid: price - 1,
      ask: price + 1,
    };
    bidAskMap[symbol] = BidAsk;

    // 4. Add Pub/Sub publish
    await redisClient.publish("binance:pubsub", JSON.stringify(BidAsk));

  } catch (err) {
    console.error("Error parsing message:", err);
  }
});

ws.on("error", (err) => {
  console.error("WebSocket error:", err);
});
