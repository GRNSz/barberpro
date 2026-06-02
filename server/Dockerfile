# --- Estágio 1: Dependências ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# --- Estágio 2: Execução ---
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "index.js"]
