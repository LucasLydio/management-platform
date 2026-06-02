import type { Prisma } from "@prisma/client";

import { prisma } from "../../core/database/prisma";

export class AuthRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  createLocal(data: { email: string; name: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        authProvider: "LOCAL",
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
      },
    });
  }

  upsertGoogle(data: { email: string; googleId: string; name: string }) {
    return prisma.user.upsert({
      create: {
        authProvider: "GOOGLE",
        email: data.email,
        googleId: data.googleId,
        name: data.name,
      },
      update: {
        authProvider: "GOOGLE",
        googleId: data.googleId,
        name: data.name,
      },
      where: { email: data.email },
    });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ data, where: { id } });
  }
}

