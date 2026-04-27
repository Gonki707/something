import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function signToken(user) {
    return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
}
export function requireAdmin(req, res, next) {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : req.cookies?.token;
    if (!token)
        return res.status(401).json({ error: 'Не сте најавени' });
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded;
        if (decoded.role !== 'admin')
            return res.status(403).json({ error: 'Забранет пристап' });
        next();
    }
    catch {
        return res.status(401).json({ error: 'Невалиден токен' });
    }
}
