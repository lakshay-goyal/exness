import { setupTimescale, client as pgClient } from "./db/timeScaleDB.js";
import { redisClient } from "./connect/redis.js";
import dotenv from "dotenv";
dotenv.config();

async function main() {

  // Connect TimescaleDB
  await setupTimescale();

  let BATCH_SIZE = 0; // current batch counter
  const BATCH_LIMIT = 100; // reset after 100 inserts

  while (true) {
    try {
      const msg = await redisClient.lPop("binance:trades");
      if (msg) {
        const trade = JSON.parse(msg);

        // format Binance trade schema
        const time = new Date(trade.data.T);
        const symbol = trade.data.s;
        const price = trade.data.p;
        const volume = trade.data.q;
        const trade_id = trade.data.t;
        const side = trade.data.m ? "sell" : "buy";

        // Insert into TimescaleDB
        await pgClient.query(
          `INSERT INTO trades (time, symbol, price, volume, trade_id, side)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING;`,
          [time, symbol, price, volume, trade_id, side]
        );

        BATCH_SIZE++;
      } else {
        // Sleep 100ms if no message in queue
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Reset batch counter after 100 inserts
      if (BATCH_SIZE >= BATCH_LIMIT) {
        BATCH_SIZE = 0;
      }
    } catch (err) {
      console.error("Error processing trade:", err);
    }
  }
}

main();
