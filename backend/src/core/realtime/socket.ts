import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";

import { verifyAccessToken } from "../../modules/auth/token.service";
import { env } from "../config/env";
import { realtimeEvents } from "./events";

export const createSocketServer = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      credentials: true,
      origin: env.CORS_ORIGINS,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const payload = typeof token === "string" ? verifyAccessToken(token) : null;

    if (!payload) return next(new Error("Unauthorized"));

    socket.data.userId = payload.sub;
    return next();
  });

  io.on("connection", (socket) => {
    socket.join(socket.data.userId);
  });

  realtimeEvents.on("task.changed", ({ ownerId, payload }) => {
    io.to(ownerId).emit("task.changed", payload);
  });

  return io;
};
