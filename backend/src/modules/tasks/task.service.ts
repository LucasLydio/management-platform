import type { TaskPriority, TaskStatus } from "@prisma/client";

import { cacheStore } from "../../core/cache/cache-store";
import { AppError } from "../../core/http/errors";
import { realtimeEvents } from "../../core/realtime/events";
import { createPaginationMeta } from "../../utils/pagination";
import { TaskRepository } from "./task.repository";

type Actor = {
  id: string;
  role: "ADMIN" | "COMMON";
};

const taskRepository = new TaskRepository();

const isAllowed = (actor: Actor, ownerId: string) => actor.role === "ADMIN" || actor.id === ownerId;
type TaskListResponse = {
  data: Awaited<ReturnType<TaskRepository["list"]>>["items"];
  meta: ReturnType<typeof createPaginationMeta>;
};

export class TaskService {
  async list(input: {
    actor: Actor;
    limit: number;
    page: number;
    search?: string;
    skip: number;
    status?: TaskStatus;
  }) {
    const cacheKey = `tasks:${input.actor.id}:${input.actor.role}:${input.page}:${input.limit}:${
      input.status ?? "all"
    }:${input.search ?? ""}`;
    const cached = await cacheStore.get<TaskListResponse>(cacheKey);
    if (cached) return cached;

    const { items, total } = await taskRepository.list({
      limit: input.limit,
      ownerId: input.actor.id,
      page: input.page,
      role: input.actor.role,
      search: input.search,
      skip: input.skip,
      status: input.status,
    });
    const response: TaskListResponse = {
      data: items,
      meta: createPaginationMeta(total, input.page, input.limit),
    };

    await cacheStore.set(cacheKey, response, 30);
    return response;
  }

  async create(input: {
    actor: Actor;
    description?: string | null;
    dueDate?: string | null;
    priority: TaskPriority;
    title: string;
  }) {
    const task = await taskRepository.create({
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      ownerId: input.actor.id,
      priority: input.priority,
      title: input.title,
    });

    await cacheStore.deleteByPrefix("tasks:");
    realtimeEvents.emit("task.changed", { ownerId: input.actor.id, payload: task });
    return task;
  }

  async update(
    id: string,
    actor: Actor,
    input: {
      description?: string | null;
      dueDate?: string | null;
      priority?: TaskPriority;
      status?: TaskStatus;
      title?: string;
    },
  ) {
    const task = await taskRepository.findById(id);
    if (!task) throw new AppError("Task not found", 404);
    if (!isAllowed(actor, task.ownerId)) throw new AppError("Forbidden", 403);

    const updatedTask = await taskRepository.update(id, {
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : input.dueDate,
      priority: input.priority,
      status: input.status,
      title: input.title,
    });

    await cacheStore.deleteByPrefix("tasks:");
    realtimeEvents.emit("task.changed", { ownerId: updatedTask.ownerId, payload: updatedTask });
    return updatedTask;
  }

  async delete(id: string, actor: Actor) {
    const task = await taskRepository.findById(id);
    if (!task) throw new AppError("Task not found", 404);
    if (!isAllowed(actor, task.ownerId)) throw new AppError("Forbidden", 403);

    await taskRepository.delete(id);
    await cacheStore.deleteByPrefix("tasks:");
    realtimeEvents.emit("task.changed", { ownerId: task.ownerId, payload: { id, deleted: true } });
  }
}
