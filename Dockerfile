FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock /app/
RUN bun install --frozen-lockfile

COPY . /app
RUN bun run build:base

FROM oven/bun:1 AS runner

WORKDIR /app
COPY package.json bun.lock /app/
RUN bun install --ignore-scripts --production --frozen-lockfile
COPY --from=builder /app/.output /app/.output

CMD ["bun", "run", "/app/.output/server/index.mjs"]
