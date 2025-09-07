// File: getFile.js
import fs from 'fs/promises';
import path from 'path';
import express from 'express';

const router = express.Router();
const obsidianDir = path.resolve('./shared/obsidian');

// GET /api/getFile?path=subdir/filename.md
router.get('/', async (req, res) => {
  const { path: userPath } = req.query;

  if (!userPath) {
    return res.status(400).json({ error: 'Missing path query parameter' });
  }

  try {
    const fullPath = path.resolve(obsidianDir, userPath);

    // Security: Prevent escaping the vault directory
    if (!fullPath.startsWith(obsidianDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const content = await fs.readFile(fullPath, 'utf8');
    res.send(content); // return as plain text
  } catch (err) {
    res.status(500).json({ error: `Unable to read file: ${err.message}` });
  }
});

export default router;
