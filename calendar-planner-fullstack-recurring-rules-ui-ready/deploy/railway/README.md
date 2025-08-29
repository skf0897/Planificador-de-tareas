# Railway Deploy

Vamos a crear **dos servicios** en el mismo proyecto Railway:

## 1) API (Node/Express)
- New → Service → Deploy from Repo.
- En `Root Directory`: `server`.
- Variables:
  - `PORT=4000`
  - `JWT_SECRET` (genera uno)
  - `COOKIE_NAME=token`
  - `MONGO_URI` (usa **Addons → MongoDB** o tu Atlas).
- Railway detectará Node y usará Nixpacks. Start command: `node src/index.js`.

## 2) WEB (Vite estático con Nginx)
Opción A (más simple): despliega el frontend en **Vercel** (mira `deploy/vercel-frontend`) y apúntalo a la API de Railway.
Opción B (en Railway con Docker):
- New → Service → Deploy from Repo.
- En `Root Directory`: `client` (usa nuestro `client/Dockerfile`).
- Variable de build: `VITE_API_URL=https://TU-API.up.railway.app/api` (se pasa como ARG en Dockerfile).
- Puertos: expón 80.

> También puedes usar el Compose que ya trae el repo para correr todo en una VM/host tuyo.
