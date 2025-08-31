import { createClient } from "redis";

// 1. Connect to Redis as Subscriber
const subscriber = createClient({
  url: process.env.REDIS_URL!,
});
subscriber.on("error", (err) => console.error("Redis Subscriber Error", err));
await subscriber.connect();

export {subscriber};