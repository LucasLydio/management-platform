export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  createdAt: string;
  description: string | null;
  dueDate: string | null;
  id: string;
  ownerId: string;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
  updatedAt: string;
};

export type TaskInput = {
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  title: string;
};

export type TaskUpdate = Partial<TaskInput> & {
  status?: TaskStatus;
};
