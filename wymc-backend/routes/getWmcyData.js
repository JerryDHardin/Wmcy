import { Router } from 'express';
import { readAllWmcyData } from '../WmcyLogEngine.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const data = readAllWmcyData();
    res.json(data);
  } catch (err) {
    console.error("Failed to read Wmcy data:", err);
    res.status(500).json({ error: 'Failed to read Wmcy data' });
  }
});

export default router;
