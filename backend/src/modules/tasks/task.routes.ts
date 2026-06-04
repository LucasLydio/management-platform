import { Router } from "express";

import { requireAuth } from "../../core/http/middlewares/require-auth";
import { parsePagination } from "../../utils/pagination";
import { createTaskSchema, listAllTasksSchema, listTasksSchema, taskIdSchema, updateTaskSchema } from "./task.schemas";
import { TaskService } from "./task.service";

const taskService = new TaskService();

export const taskRoutes = Router();

taskRoutes.use(requireAuth);

taskRoutes.get("/all", async (request, response, next) => {
  try {
    const { query } = listAllTasksSchema.parse(request);
    const result = await taskService.listAll({
      actor: request.user!,
      search: query.search,
      status: query.status,
    });

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

taskRoutes.get("/", async (request, response, next) => {
  try {
    const { query } = listTasksSchema.parse(request);
    const pagination = parsePagination(query);
    const result = await taskService.list({
      actor: request.user!,
      limit: pagination.limit,
      page: pagination.page,
      search: query.search,
      skip: pagination.skip,
      status: query.status,
    });

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

taskRoutes.post("/", async (request, response, next) => {
  try {
    const { body } = createTaskSchema.parse(request);
    const task = await taskService.create({ actor: request.user!, ...body });
    response.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
});

taskRoutes.patch("/:id", async (request, response, next) => {
  try {
    const { body, params } = updateTaskSchema.parse(request);
    const task = await taskService.update(params.id, request.user!, body);
    response.status(200).json({ data: task });
  } catch (error) {
    next(error);
  }
});

taskRoutes.delete("/:id", async (request, response, next) => {
  try {
    const { params } = taskIdSchema.parse(request);
    await taskService.delete(params.id, request.user!);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
