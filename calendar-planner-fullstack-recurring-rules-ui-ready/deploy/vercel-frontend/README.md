# Vercel (Frontend)

Este directorio contiene `vercel.json` para desplegar **solo el frontend** en Vercel.

## Pasos
1. Despliega la **API** primero (en Render/Railway). Obtén la URL pública, p.ej. `https://calendar-planner-api.onrender.com`.
2. En `deploy/vercel-frontend/vercel.json`, reemplaza `REPLACE_WITH_API_HOST` por el host de tu API (sin `/api` al final). Ejemplo:
   ```json
   { "src": "/api/(.*)", "dest": "https://calendar-planner-api.onrender.com/api/$1" }
   ```
3. En la raíz del repo, ejecuta `vercel` o conecta el repo en el dashboard de Vercel. Configura el build command del frontend: `npm --prefix client ci && npm --prefix client run build` y output dir: `client/dist`.
4. Alternativa: en lugar de rewrites, puedes compilar con `VITE_API_URL` apuntando a tu API:
   ```bash
   cd client
   VITE_API_URL=https://calendar-planner-api.onrender.com npm run build
   ```
