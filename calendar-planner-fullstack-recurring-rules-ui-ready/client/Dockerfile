# Client (Vite build + Nginx serve)

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
# VITE_ vars are read at build time
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx config to proxy /api to the api service
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
