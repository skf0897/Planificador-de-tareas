# Render Deploy

Hay dos servicios:
1. **API** (Node/Express) → `render.api.yaml`
2. **WEB** (estático Vite+Nginx) → `render.client.yaml`

## Pasos
1. Crea un repo y sube el proyecto.
2. En Render, **New → Blueprint** y selecciona `render.api.yaml` para la API (o usa el botón Blueprint y elige el archivo). Alternativamente, crea un Web Service apuntando a `/server`.
3. Configura `MONGO_URI` (Render Mongo o Atlas) y deja `JWT_SECRET` en auto.
4. Despliega la API; copia su URL, algo como `https://calendar-planner-api.onrender.com`.
5. Crea el sitio estático usando `render.client.yaml` y define `API_URL` con la URL de la API del paso 4.
6. Despliega y prueba el sitio.

> Nota: El frontend se compila con `VITE_API_URL=$API_URL`, así que las llamadas irán a tu API pública.
