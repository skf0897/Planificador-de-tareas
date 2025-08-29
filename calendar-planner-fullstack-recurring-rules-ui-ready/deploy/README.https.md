# HTTPS con Caddy o Traefik

## Opción A — Caddy
1. Edita `deploy/caddy/Caddyfile` y reemplaza `you@example.com` con tu email válido.
2. En `docker-compose.yml`, agrega un servicio `caddy` con el Dockerfile oficial de Caddy, monta el `Caddyfile`.
3. Al levantarlo (`docker compose up`), Caddy obtiene certificados TLS de Let's Encrypt automáticamente.

## Opción B — Traefik
Ya tienes un ejemplo listo en `deploy/docker-compose.traefik.yml`:
```bash
docker compose -f deploy/docker-compose.traefik.yml up --build
```
- Cambia `example.com` por tu dominio real.
- Traefik gestionará certificados de Let's Encrypt automáticamente.
- `web` (frontend) estará en https://example.com
- `api` (backend) estará en https://example.com/api

### Notas
- Asegúrate de apuntar tu dominio (A/AAAA) a la IP del servidor.
- Abre puertos 80 y 443 en firewall.
- Let's Encrypt requiere dominio válido, no funciona en `localhost`.

