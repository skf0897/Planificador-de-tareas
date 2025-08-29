# Calendar Planner — Server

Node.js + Express + MongoDB (Mongoose). JWT en cookie httpOnly.

## Scripts
- `npm install`
- `npm run dev` (puerto 4000)
- `npm start`

## Variables de entorno (.env)
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/calendar_planner
JWT_SECRET=un_super_secreto_largo
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
COOKIE_NAME=token
```



## Google OAuth + Calendar
Variables necesarias (.env):
```
GOOGLE_CLIENT_ID=tu_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_secreto
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
GOOGLE_SCOPES=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar
```

Rutas:
- `GET /api/auth/google` → inicia flujo OAuth (redirige a Google).
- `GET /api/auth/google/callback` → callback; guarda `refresh_token` si Google lo entrega; crea cookie JWT.
- `GET /api/calendar/list` → lista próximos eventos (30 días) del usuario.
- `POST /api/calendar/create` `{ summary, description?, startISO, endISO }` → crea evento.
