import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL!,
});
redisClient.on("error", (err: any) => console.error("Redis Client Error", err));
await redisClient.connect();

export { redisClient };
