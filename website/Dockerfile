# Stage 1: 构建 Astro 静态产物
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 使用 Secret Mount 注入环境变量，值不会持久化到镜像中
RUN --mount=type=secret,id=PUBLIC_UMAMI_WEBSITE_ID,required=false \
    --mount=type=secret,id=PUBLIC_UMAMI_SCRIPT_URL,required=false \
    export PUBLIC_UMAMI_WEBSITE_ID=$(cat /run/secrets/PUBLIC_UMAMI_WEBSITE_ID 2>/dev/null || echo "") && \
    export PUBLIC_UMAMI_SCRIPT_URL=$(cat /run/secrets/PUBLIC_UMAMI_SCRIPT_URL 2>/dev/null || echo "") && \
    npm run build

# Stage 2: 用 Caddy 提供静态服务（无 TLS，由网关 Caddy 处理）
FROM caddy:2.8-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
