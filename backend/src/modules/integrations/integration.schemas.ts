import { z } from "zod";

export const integrationTaskParamsSchema = z.object({
  taskId: z.uuid(),
});

export const integrationRequestSchema = z.object({
  params: integrationTaskParamsSchema,
});

export const notionCallbackSchema = z.object({
  query: z.object({
    code: z.string().min(1).optional(),
    error: z.string().min(1).optional(),
    error_description: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
  }),
});
