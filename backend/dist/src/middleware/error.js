function toHttpError(err) {
    if (err instanceof Error)
        return err;
    return Object.assign(new Error(String(err)), { status: 500 });
}
export function errorHandler(err, _req, res, _next) {
    const e = toHttpError(err);
    console.error('[error]', e);
    const status = e.status ?? e.statusCode ?? 500;
    res.status(status).json({
        error: e.message || 'Internal server error',
        details: e.details,
    });
}
