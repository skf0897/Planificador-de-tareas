# Calendar Planner — Client (Vite + React + Tailwind)

## Scripts
- `npm install`
- `npm run dev` (puerto 5173)

## Env
Crea `.env` con:
```
VITE_API_URL=http://localhost:4000
```


## Docker
La imagen del cliente se construye con `VITE_API_URL=/api` y Nginx proxy a la API.


## Vista previa sin backend
Puedes compilar y ver solo el frontend (sin API) con:
```bash
npm run build
npm run preview
```
Esto abrirá el sitio en http://localhost:5174 (pero las funciones que llaman a la API no funcionarán sin levantar el servidor).


## Modo demo (offline, sin backend)
Si solo quieres probar la interfaz sin levantar el servidor:
1. Edita `src/App.jsx` y cambia la importación de:
   ```js
   import { Auth, Tasks } from './api.js'
   ```
   a
   ```js
   import { Auth, Tasks } from './api.demo.js'
   ```
2. Luego ejecuta:
   ```bash
   npm run build
   npm run preview
   ```
3. Abre [http://localhost:5174](http://localhost:5174) y tendrás un demo 100% local
   (las tareas se guardan en `localStorage`).



## Modo DEMO (offline, sin backend)
Puedes probar la app **sin servidor**; se guarda todo en `localStorage`:
```bash
# desarrollo
npm run dev:demo
# build y vista previa demo
npm run build:demo
npm run preview:demo
```
- Dev: http://localhost:5173 (con VITE_DEMO=1)
- Preview: http://localhost:5175
Tus tareas quedan en el navegador. (Login simulado con `demo@example.com`).


## Despliegue rápido en Vercel (frontend)
1. En Vercel, **Root Directory**: esta carpeta `client` (o `calendar-planner-fullstack-recurring-rules-ui/client` si tu repo es monorepo).
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**: `VITE_API_URL=https://TU-API.onrender.com/api`
5. Deploy.
