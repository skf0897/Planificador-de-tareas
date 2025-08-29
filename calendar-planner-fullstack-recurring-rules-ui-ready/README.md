# Calendar Planner — Fullstack

Planner de calendario con checklist por día. Stack:
- **Frontend**: Vite + React + Tailwind, animación 3D sutil.
- **Backend**: Node.js + Express + MongoDB, JWT en cookie httpOnly, Helmet, rate-limit, CORS, validaciones.

## Instalación rápida

### 1) Servidor
```bash
cd server
cp .env.example .env
# Edita MONGO_URI si es necesario
npm install
npm run dev
```
### 2) Cliente
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Abre http://localhost:5173

## Notas de seguridad
- Autenticación con cookie httpOnly + SameSite=Lax
- Helmet, Rate limiting y validaciones básicas
- CORS restringido a `FRONTEND_ORIGIN`

## Endpoints principales
- `POST /api/auth/register` {email,password}
- `POST /api/auth/login` {email,password}
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/tasks?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /api/tasks/:date`
- `POST /api/tasks` {date,text}
- `PATCH /api/tasks/:id` {text?,done?}
- `DELETE /api/tasks/:id`



## Docker (todo en uno)

Requisitos: Docker y Docker Compose.

```bash
# En la carpeta raíz del proyecto
docker compose up --build
```

- Web: http://localhost:8080
- API: accesible vía `/api` a través de Nginx (mismo dominio)
- MongoDB: puerto 27017 (persistencia en volumen `mongo_data`)

### Variables
Modifica `docker-compose.yml` si quieres cambiar `JWT_SECRET`, puertos o `FRONTEND_ORIGIN`.

### Producción
- Cambia `NODE_ENV=production` y en server asegúrate de usar `secure: true` si sirves por HTTPS (ya se maneja con la variable en el código).
- Puedes apuntar el `web` detrás de un proxy con TLS (Caddy/Traefik/Nginx con certificados).


## Deploy en Render, Railway o Vercel

### Render
- Usa `render.yaml` en la raíz.
- Despliega `calendar-api` (Node) y `calendar-web` (static).
- Configura variables: `MONGO_URI`, `JWT_SECRET`.

### Railway
- Usa `railway.json` (Nixpacks).
- Configura variables de entorno en el panel.

### Vercel
- Deploy del **frontend** desde `client/`.
- Configura `VITE_API_URL` apuntando al API (ej: `https://<tu-api>.onrender.com/api`).
- Ajusta rutas en `vercel.json` si cambias dominio de API.



### Tareas recurrentes (semanales)
- Nueva colección `Recurring` con `weekday`, `startDate`, `endDate?`.
- Endpoints: `GET/POST/DELETE /api/recurring`.
- `GET /api/tasks` expande ocurrencias virtuales dentro del rango.
- `POST /api/tasks/materialize` crea la instancia real al marcar completado.
- En la UI, marca **Repetir cada semana** al crear una tarea en el modal del día.
