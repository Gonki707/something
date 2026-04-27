import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { requireAdmin } from '../middleware/auth.js';
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });
// Strict allowlists. Public uploads are images only. Admin uploads also allow PDFs and Office docs.
const PUBLIC_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const PUBLIC_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ADMIN_MIME = new Set([
    ...PUBLIC_MIME,
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
]);
const ADMIN_EXT = new Set([
    ...PUBLIC_EXT,
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt',
]);
function buildUploader(allowedMime, allowedExt, maxBytes) {
    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const base = path
                .basename(file.originalname, ext)
                .replace(/[^\w-]+/g, '_')
                .slice(0, 80);
            cb(null, `${Date.now()}_${base}${ext}`);
        },
    });
    return multer({
        storage,
        limits: { fileSize: maxBytes, files: 20 },
        fileFilter: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowedExt.has(ext) || !allowedMime.has(file.mimetype)) {
                return cb(new Error('Недозволен тип на датотека'));
            }
            cb(null, true);
        },
    });
}
const publicUploader = buildUploader(PUBLIC_MIME, PUBLIC_EXT, 8 * 1024 * 1024); // 8 MB images
const adminUploader = buildUploader(ADMIN_MIME, ADMIN_EXT, 25 * 1024 * 1024); // 25 MB
const router = Router();
// Public upload — IMAGES ONLY, used by the report-problem form.
router.post('/public', publicUploader.single('file'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'Нема прикачена датотека' });
    res.json({ path: `/uploads/${req.file.filename}`, originalName: req.file.originalname });
});
// Admin upload (single or multiple), wider allowlist.
router.post('/admin', requireAdmin, adminUploader.array('files', 20), (req, res) => {
    const files = req.files || [];
    res.json({
        files: files.map((f) => ({ path: `/uploads/${f.filename}`, originalName: f.originalname })),
    });
});
const uploadErrorHandler = (err, _req, res, next) => {
    const e = err instanceof Error ? err : new Error(String(err));
    if (err instanceof multer.MulterError || e.message === 'Недозволен тип на датотека') {
        return res.status(400).json({ error: e.message });
    }
    next(err);
};
router.use(uploadErrorHandler);
export default router;
