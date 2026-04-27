import 'dotenv/config';
const isProd = process.env.NODE_ENV === 'production';
function required(name, devFallback) {
    const raw = process.env[name];
    if (raw && raw.length > 0)
        return raw;
    if (!isProd && devFallback)
        return devFallback;
    throw new Error(`Missing required env var: ${name}`);
}
export const env = {
    DATABASE_URL: required('DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/mavrovo'),
    JWT_SECRET: required('JWT_SECRET', 'dev-secret-change-me'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PROD: isProd,
    PORT: Number(process.env.PORT || 4000),
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@mavrovo.gov.mk',
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'Администратор',
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: Number(process.env.SMTP_PORT || 587),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    MAIL_FROM: process.env.MAIL_FROM || 'noreply@mavrovo.gov.mk',
    MAIL_TO: process.env.MAIL_TO || 'info@mavrovo.gov.mk',
};
