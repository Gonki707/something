import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import problemsRouter from './routes/problems.js';
import { publicRouter, adminRouter } from './routes/crud.js';
export function buildApp() {
    const app = express();
    app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cookieParser());
    app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
    app.get('/api/health', (_req, res) => res.json({ ok: true }));
    app.use('/api/auth', authRouter);
    app.use('/api/upload', uploadRouter);
    app.use('/api/problems', problemsRouter);
    app.use('/api/public', publicRouter);
    app.use('/api/admin', adminRouter);
    // Serve frontend static files in production
    if (process.env.NODE_ENV === 'production') {
        const distPath = path.resolve(process.cwd(), '../frontend/dist');
        app.use(express.static(distPath));
        app.get('*', (_req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }
    app.use(errorHandler);
    return app;
}
