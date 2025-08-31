// get bid/ask data 
import { createClient } from "redis";
import { prices } from "../utils/price.js";

// 1. Connect to Redis as Subscriber
const subscriber = createClient({ url: "redis://localhost:6379" });
subscriber.on("error", (err) => console.error("Redis Subscriber Error", err));
await subscriber.connect();

await subscriber.subscribe("binance:pubsub", (message) => {
  const data = JSON.parse(message); // { symbol: 'ETHUSDT', bid: 4476.1, ask: 4478.1 }
  // normalize symbol key to lowercase
  const key = data.symbol.toLowerCase();

  // update prices object
  prices[key] = { bid: data.bid, ask: data.ask };
});

export { subscriber };