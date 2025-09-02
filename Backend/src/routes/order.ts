import { Router, type Request, type Response } from "express";
import { OpenOrder, GetOpenOrders, GetClosedOrders, CloseOrder } from "../utils/order.js";
import { subscriber } from "../connect/pubsub.js";
import { prices } from "../utils/price.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// POST /order/trade - Create a new order
router.post("/trade", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  const { symbol, type, quantity, leverage } = req.body;

  // Check if user is attached by authMiddleware
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  if (!symbol || !type || !quantity || !leverage) {
    return res.status(400).json({ error: "Missing required parameters: symbol, type, quantity, leverage" });
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

    const order = await OpenOrder({ 
      userId: req.user.id,
      symbol: String(symbol), 
      type: String(type).toLowerCase(), // Convert to lowercase to match schema
      quantity: Number(quantity), 
      leverage: Number(leverage),
      status: "open",
    });

    console.log("📋 Order created:", order);
    console.log("📊 Current prices:", prices);

    res.json({ 
      order,
      message: "Order created successfully"
    });

  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ 
      error: "Failed to create order",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /order/open - Get all open orders for a user
router.get("/open", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  try {
    const orders = await GetOpenOrders({ userId: req.user.id });
    res.json({ orders });
  } catch (error) {
    console.error("❌ Error retrieving open orders:", error);
    res.status(500).json({ 
      error: "Failed to retrieve open orders",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /order/close - Close an open order for a user
router.post("/close", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  const { orderId } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  if (!orderId) {
    return res.status(400).json({ error: "Missing required parameter: orderId" });
  }

  try {
    const closedOrder = await CloseOrder(orderId, req.user.id);
    res.json({ 
      order: closedOrder,
      message: "Order closed successfully"
     });
  } catch (error) {
    console.error("❌ Error closing order:", error);
    res.status(500).json({
      error: "Failed to close order",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /order/closed - Get all closed orders for a user
router.get("/close", authMiddleware, async (req: Request & { user?: any }, res: Response) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  try {
    const orders = await GetClosedOrders({ userId: req.user.id });
    res.json({ orders });
  } catch (error) {
    console.error("❌ Error retrieving closed orders:", error);
    res.status(500).json({ 
      error: "Failed to retrieve closed orders",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
