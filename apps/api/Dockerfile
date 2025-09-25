FROM node:20-alpine AS base
WORKDIR /app
COPY ../../package.json ../../pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@8.12.0 --activate
COPY ../../pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY ../../ .
RUN pnpm --filter api build
CMD ["pnpm", "--filter", "api", "start:prod"]
