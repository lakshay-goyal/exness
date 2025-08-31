import { Router, type Request, type Response } from "express";
import { OpenOrder } from "../utils/order.js";
import { subscriber } from "../connect/pubsub.js";
import { prices } from "../utils/price.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/open", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  const { symbol, type, quantity, leverage } = req.body;

  // Check if user is attached by authMiddleware
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  if (!symbol || !type || !quantity || !leverage) {
    return res.status(400).send("Missing required query parameters");
  }

  try {
    // Ensure pubsub connection is active and prices are updated
    if (!subscriber.isOpen) {
      await subscriber.connect();
    }

    // Wait a moment for prices to be updated from pubsub
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if we have price data for the symbol
    const symbolKey = symbol.toLowerCase();
    if (!prices[symbolKey]) {
      return res.status(400).json({ 
        error: `No price data available for ${symbol}. Please try again.` 
      });
    }

    // userId: req.user.id,
    const order = await OpenOrder({ 
      userId: req.user.id,
      symbol: String(symbol), 
      type: String(type), 
      quantity: Number(quantity), 
      leverage: Number(leverage),
      openPrice: Number(prices[symbolKey].bid),
      // openTime: new Date(),
      status: "open",
    });

    console.log("📋 Order created:", order);
    console.log("📊 Current prices:", prices);

    res.json({ 
      order,
    });

  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ 
      error: "Failed to create order",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
