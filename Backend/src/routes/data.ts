import type { Request, Response } from "express";
import { Router } from "express";
import { getTimeRange, RetreiveData } from "../utils/candle.js";

const router = Router();

export const getCandles = async (req: Request, res: Response) => {
    const { symbol, interval } = req.query;
  
    if (!symbol || !interval) {
      return res.status(400).send("Missing required query parameters");
    }
  
    try {
      const { from, to } = getTimeRange(interval as string);

      const data = await RetreiveData(
        symbol as string,
        interval as string,
        from,
        to
      );

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
};

// Add the candles endpoint route
router.get("/candles", getCandles);

export default router;