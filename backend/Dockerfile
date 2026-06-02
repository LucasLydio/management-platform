FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM deps AS build
COPY . .
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/management
RUN npx prisma generate --schema src/infra/database/schema.prisma
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/infra/database ./src/infra/database
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
EXPOSE 3333
CMD ["node", "dist/src/main.js"]
