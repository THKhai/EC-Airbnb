# Frontend (Next.js). NEXT_PUBLIC_* are inlined into the JS bundle at build time -> build args.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_AUTH0_DOMAIN=""
ARG NEXT_PUBLIC_AUTH0_CLIENT_ID=""
ARG NEXT_PUBLIC_AUTH0_AUDIENCE=""
ARG NEXT_PUBLIC_PAYMENT_MOCK=true
ARG NEXT_PUBLIC_LOCATIONIQ_API_KEY=""
ARG NEXT_PUBLIC_PUSHER_KEY=""
ARG NEXT_PUBLIC_PUSHER_CLUSTER=""
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/next.config.mjs ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["npx", "next", "start", "-p", "3000"]
