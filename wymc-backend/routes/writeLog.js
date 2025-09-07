import fs from 'fs/promises';
import path from 'path';
import express from 'express';

const router = express.Router();
const logsDir = path.resolve('./wmcy-logs');

router.post('/', async (req, res) => {
  const { entry } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const logFile = path.join(logsDir, `${date}.md`);

  try {
    await fs.mkdir(logsDir, { recursive: true });
    await fs.appendFile(logFile, `\n${entry}\n`, 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: `Log write failed: ${err.message}` });
  }
});

export default router;
