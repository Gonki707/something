import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/db.js';
import { prijaveniProblemi } from '../db/schema.js';
import { sendMail } from '../config/mailer.js';
const router = Router();
const schema = z.object({
    fullName: z.string().min(2),
    typeOfProblemId: z.number().int().nullable().optional(),
    description: z.string().min(5),
    picture: z.string().nullable().optional(),
    naselenoMestoId: z.number().int().nullable().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
});
router.post('/', async (req, res, next) => {
    try {
        const data = schema.parse(req.body);
        const [row] = await db.insert(prijaveniProblemi).values({
            fullName: data.fullName,
            typeOfProblemId: data.typeOfProblemId ?? null,
            description: data.description,
            picture: data.picture ?? null,
            naselenoMestoId: data.naselenoMestoId ?? null,
            phoneNumber: data.phoneNumber ?? null,
            email: data.email || null,
        }).returning();
        const text = [
            'Нова пријава на проблем',
            `Име: ${data.fullName}`,
            `Е-маил: ${data.email || '-'}`,
            `Телефон: ${data.phoneNumber || '-'}`,
            `Тип проблем (ID): ${data.typeOfProblemId ?? '-'}`,
            `Населено место (ID): ${data.naselenoMestoId ?? '-'}`,
            '',
            'Опис:',
            data.description,
        ].join('\n');
        await sendMail({
            subject: `Нова пријава на проблем — ${data.fullName}`,
            text,
        }).catch((e) => console.warn('[mailer] failed:', e?.message));
        res.status(201).json({ ok: true, id: row.id });
    }
    catch (e) {
        next(e);
    }
});
export default router;
