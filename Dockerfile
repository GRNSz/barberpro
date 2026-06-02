# Stage 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx + OpenSSL for cert bootstrap
FROM nginx:stable-alpine
RUN apk add --no-cache openssl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY init-ssl.sh /docker-entrypoint.d/99-init-ssl.sh
RUN chmod +x /docker-entrypoint.d/99-init-ssl.sh
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
