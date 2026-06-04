import type { Prisma, TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "../../core/database/prisma";

export type TaskListFilters = {
  limit: number;
  ownerId: string;
  page: number;
  role: "ADMIN" | "COMMON";
  search?: string;
  skip: number;
  status?: TaskStatus;
};

type TaskFilters = Omit<TaskListFilters, "limit" | "page" | "skip">;

const makeWhere = (filters: TaskFilters): Prisma.TaskWhereInput => ({
  ...(filters.role === "COMMON" ? { ownerId: filters.ownerId } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.search
    ? {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      }
    : {}),
});

export class TaskRepository {
  async list(filters: TaskListFilters) {
    const where = makeWhere(filters);
    const [items, total] = await prisma.$transaction([
      prisma.task.findMany({
        include: { owner: { select: { email: true, id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.limit,
        where,
      }),
      prisma.task.count({ where }),
    ]);

    return { items, total };
  }

  listAll(filters: TaskFilters) {
    return prisma.task.findMany({
      include: { owner: { select: { email: true, id: true, name: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      where: makeWhere(filters),
    });
  }

  findById(id: string) {
    return prisma.task.findUnique({ where: { id } });
  }

  create(input: {
    description?: string | null;
    dueDate?: Date | null;
    ownerId: string;
    priority: TaskPriority;
    title: string;
  }) {
    return prisma.task.create({ data: input });
  }

  update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ data, where: { id } });
  }

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  }
}
