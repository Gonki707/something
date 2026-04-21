import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { requireAdmin } from '../middleware/auth.js';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^\w.-]+/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

const router = Router();

// Public upload (used by report-problem form for image attachments)
router.post('/public', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Нема прикачена датотека' });
  res.json({ path: `/uploads/${req.file.filename}`, originalName: req.file.originalname });
});

// Admin upload (single or multiple)
router.post('/admin', requireAdmin, upload.array('files', 20), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  res.json({
    files: files.map((f) => ({ path: `/uploads/${f.filename}`, originalName: f.originalname })),
  });
});

export default router;
