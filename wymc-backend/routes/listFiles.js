// File: listFiles.js
import fs from 'fs/promises';
import path from 'path';
import express from 'express';

const router = express.Router();
const obsidianDir = path.resolve('./shared/obsidian');

router.get('/', async (req, res) => {
  const { path: subPath = '' } = req.query;
  const targetDir = path.resolve(obsidianDir, subPath);

  // Security: block path escape
  if (!targetDir.startsWith(obsidianDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const listing = entries.map((e) => ({
      name: e.name,
      type: e.isDirectory() ? 'folder' : 'file'
    }));
    res.json({ files: listing });
  } catch (err) {
    res.status(500).json({ error: `Unable to list directory: ${err.message}` });
  }
});

export default router;
