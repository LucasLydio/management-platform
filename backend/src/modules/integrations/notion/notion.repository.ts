import type { Prisma } from "@prisma/client";

import { prisma } from "../../../core/database/prisma";

export class NotionRepository {
  findByUserId(userId: string) {
    return prisma.notionConnection.findUnique({ where: { userId } });
  }

  upsertByUserId(
    userId: string,
    data: Omit<Prisma.NotionConnectionUncheckedCreateInput, "id" | "userId">,
  ) {
    return prisma.notionConnection.upsert({
      create: {
        ...data,
        userId,
      },
      update: data,
      where: { userId },
    });
  }

  updateByUserId(userId: string, data: Prisma.NotionConnectionUpdateInput) {
    return prisma.notionConnection.update({
      data,
      where: { userId },
    });
  }
}
