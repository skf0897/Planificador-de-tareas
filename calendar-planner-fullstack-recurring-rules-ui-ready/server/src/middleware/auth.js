import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || 'token';
  const token = req.cookies?.[cookieName];
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
