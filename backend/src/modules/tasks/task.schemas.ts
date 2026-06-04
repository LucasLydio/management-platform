import { z } from "zod";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const listTasksSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    page: z.string().optional(),
    search: z.string().optional(),
    status: taskStatusSchema.optional(),
  }),
});

export const listAllTasksSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: taskStatusSchema.optional(),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    description: z.string().max(500).optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: taskPrioritySchema.default("MEDIUM"),
    title: z.string().min(2).max(120),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    description: z.string().max(500).optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
    title: z.string().min(2).max(120).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
