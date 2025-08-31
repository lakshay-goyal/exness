import { getTimeRange, RetreiveData } from "../utils/candle.js";
import { Router, type Request, type Response } from "express";
const router = Router();


router.get("/candles", async (req: Request, res: Response) => {
  const { symbol, interval } = req.query;

  if (!symbol || !interval) {
    return res.status(400).send("Missing required query parameters");
  }

  try {
    const { from, to } = getTimeRange(String(interval));
    const data = await RetreiveData({
      symbol: String(symbol),
      intervals: String(interval),
      from,
      to
    });
    res.json({
      symbol,
      interval,
      from,
      to,
      data,
    });
  } catch (err) {
    console.error("Error retrieving data", err);
    res.status(500).send("Internal server error");
  }
});

export default router;
