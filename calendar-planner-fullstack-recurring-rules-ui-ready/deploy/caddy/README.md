# Caddy + Auto HTTPS

1) Apunta tu dominio a la IP del servidor (A/AAAA).
2) Edita `deploy/caddy/Caddyfile` y reemplaza `TUDOMINIO.com`.
3) Exporta tus credenciales de Google (ver más abajo) y levanta:
```bash
export GOOGLE_CLIENT_ID=tu_id.apps.googleusercontent.com
export GOOGLE_CLIENT_SECRET=tu_secreto
docker compose -f docker-compose.yml -f deploy/caddy/docker-compose.caddy.yml up --build -d
```
- Web: https://TUDOMINIO.com
- API: https://TUDOMINIO.com/api
