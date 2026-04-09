FROM node:20-bookworm AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm install --frozen-lockfile --filter @flowforge/shared
RUN pnpm --filter @flowforge/shared build
RUN pnpm --filter @flowforge/engine build
RUN pnpm --filter @flowforge/server build
RUN cd packages/server && npx prisma generate

FROM node:20-bookworm
WORKDIR /app
COPY --from=builder /app/packages/server ./packages/server
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/engine ./packages/engine
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "packages/server/dist/index.js"]
