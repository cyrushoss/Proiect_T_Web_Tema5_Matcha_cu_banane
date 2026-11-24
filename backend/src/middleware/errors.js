// Format coerent de eroare: { error: { code, message, details } }
export function notFound(_req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resursa nu există.', details: null } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = status === 500 ? 'Eroare internă.' : err.message;
  res.status(status).json({ error: { code, message, details: err.details || null } });
}
