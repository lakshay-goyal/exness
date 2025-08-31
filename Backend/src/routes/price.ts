import express from 'express';
import { prices } from '../utils/price.js';

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  res.json({ prices });
});

export default router;
