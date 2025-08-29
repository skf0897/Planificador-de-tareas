// server/src/routes/auth.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// --- Google OAuth (importaciones arriba) ---
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = Router();

const COOKIE_NAME = process.env.COOKIE_NAME || 'token';
const FRONTEND = process.env.FRONTEND_ORIGIN || '/';

const issueToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'none',                    // <-- IMPORTANTE para Vercel + Render
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ---------- Auth básico ----------

router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email ya registrado' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });

    const token = issueToken(user);
    setAuthCookie(res, token);

    res.json({ ok: true, user: { id: user._id, email: user.email } });
  }
);

router.post(
  '/login',
  body('email').isEmail(),
  body('password').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = issueToken(user);
    setAuthCookie(res, token);

    res.json({ ok: true, user: { id: user._id, email: user.email } });
  }
);

router.post('/logout', (req, res) => {
  // Para que borre correctamente, los flags deben coincidir con los usados al setear
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id email');
    res.json({ user });
  } catch {
    res.json({ user: null });
  }
});

// ---------- Google OAuth ----------

const googleScopes = (
  process.env.GOOGLE_SCOPES ||
  'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar'
).split(' ');

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (_req, _accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            const email = profile.emails?.[0]?.value;
            user = (await User.findOne({ email })) || new User({ email });
            user.googleId = profile.id;
          }
          if (refreshToken) user.googleRefreshToken = refreshToken;
          await user.save();
          return done(null, user);
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });

  router.get(
    '/google',
    passport.initialize(),
    passport.authenticate('google', { scope: googleScopes, accessType: 'offline', prompt: 'consent' })
  );

  router.get(
    '/google/callback',
    passport.initialize(),
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req, res) => {
      const user = req.user;
      const token = issueToken(user);
      setAuthCookie(res, token);
      // Redirige a tu frontend
      res.redirect(FRONTEND);
    }
  );
}

export default router;
