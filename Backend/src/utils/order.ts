import { prices } from "./price.js";
import { type Orders } from "../interface.js";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { orders } from "../db/schema.js";

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

export async function OpenOrder({
  userId,
      symbol, 
      type, 
      quantity, 
      leverage,
      status,
}: Orders) {
  const qty = quantity;
  const symbolKey = symbol.toLowerCase();
  const priceData = prices[symbolKey];

  console.log("🔍 Looking for price data for:", symbolKey);
  console.log("📊 Available prices:", prices);
  console.log("💰 Price data found:", priceData);

  if (!priceData) {
    throw new Error(`No price data available for symbol: ${symbol}`);
  }

  const openprice = type === "buy" ? priceData.ask : priceData.bid;
  console.log("💵 Opening price:", openprice, "for", type, "order");

  const margin =
    type === "buy"
      ? (qty * priceData.ask) / leverage
      : (qty * priceData.bid) / leverage;

  const openTime = new Date();

  const order = {
    userId,
    symbol,
    type,
    quantity: qty.toString(),
    leverage,
    openPrice: openprice.toString(),
    openTime,
    margin: margin.toString(),
    status: "open",
    isActive: true,
  };

  console.log("📋 Order details:", order);

  try {
    // Store order in database
    const [insertedOrder] = await db.insert(orders).values(order).returning();
    console.log("✅ Order stored in database:", insertedOrder);

    return {
      ...order,
      id: insertedOrder?.id || undefined,
    };
  } catch (error) {
    console.error("❌ Error storing order in database:", error);
    throw new Error(`Failed to store order in database: ${error}`);
  }
}
