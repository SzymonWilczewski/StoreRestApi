FROM node:20-alpine

RUN corepack enable

WORKDIR /app
COPY . .
RUN pnpm install

ENTRYPOINT ["pnpm"]