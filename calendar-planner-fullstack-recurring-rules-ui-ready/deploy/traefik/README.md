# Traefik + Let's Encrypt

1) Apunta tu dominio a la IP del servidor.
2) Edita `deploy/traefik/dynamic.yaml` y `docker-compose.traefik.yml` para poner dominio y email.
3) Exporta credenciales Google y arranca:
```bash
export GOOGLE_CLIENT_ID=tu_id.apps.googleusercontent.com
export GOOGLE_CLIENT_SECRET=tu_secreto
docker compose -f docker-compose.yml -f deploy/traefik/docker-compose.traefik.yml up --build -d
```
