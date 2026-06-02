import { createServer } from "node:http";

import { createApp } from "./app";
import { cacheStore } from "./core/cache/cache-store";
import { env } from "./core/config/env";
import { prisma } from "./core/database/prisma";
import { createSocketServer } from "./core/realtime/socket";

const bootstrap = async () => {
  await cacheStore.connect();
  await prisma.$connect();

  const app = createApp();
  const server = createServer(app);

  createSocketServer(server);

  server.listen(env.PORT, () => {
    console.log(`Management API running on http://localhost:${env.PORT}/${env.API_PREFIX}/v1`);
  });
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});

