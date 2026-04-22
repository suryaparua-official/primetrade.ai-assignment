# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build-time ENV
ARG NEXT_PUBLIC_USER_API
ARG NEXT_PUBLIC_TASK_API

ENV NEXT_PUBLIC_USER_API=$NEXT_PUBLIC_USER_API
ENV NEXT_PUBLIC_TASK_API=$NEXT_PUBLIC_TASK_API

# Build Next.js app
RUN npm run build

# ---------- Production Stage ----------
FROM node:22-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]