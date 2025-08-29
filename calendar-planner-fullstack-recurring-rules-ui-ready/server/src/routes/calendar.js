import { Router } from 'express';
import { google } from 'googleapis';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL,
  );
  return client;
}

router.get('/list', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user?.googleRefreshToken) return res.status(400).json({ error: 'No vinculado con Google Calendar' });
  const oAuth2Client = getOAuth2Client();
  oAuth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const now = new Date();
  const in30 = new Date(now.getTime() + 30*24*60*60*1000);
  const resp = await calendar.events.list({ calendarId: 'primary', timeMin: now.toISOString(), timeMax: in30.toISOString(), singleEvents: true, orderBy: 'startTime' });
  res.json({ items: resp.data.items || [] });
});

router.post('/create', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user?.googleRefreshToken) return res.status(400).json({ error: 'No vinculado con Google Calendar' });
  const { summary, description, startISO, endISO } = req.body || {};
  if (!summary || !startISO || !endISO) return res.status(400).json({ error: 'Faltan campos' });
  const oAuth2Client = getOAuth2Client();
  oAuth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const event = await calendar.events.insert({ calendarId: 'primary', requestBody: {
    summary, description, start: { dateTime: startISO }, end: { dateTime: endISO }
  }});
  res.json({ event: event.data });
});

export default router;
