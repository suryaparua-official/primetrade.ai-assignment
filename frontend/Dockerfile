# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_USER_API
ARG NEXT_PUBLIC_TASK_API

ENV NEXT_PUBLIC_USER_API=$NEXT_PUBLIC_USER_API
ENV NEXT_PUBLIC_TASK_API=$NEXT_PUBLIC_TASK_API

# Build Next.js app (standalone in next.config.ts)
RUN npm run build

# ---------- Production Stage ----------
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
