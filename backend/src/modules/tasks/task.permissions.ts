export type TaskActor = {
  id: string;
  role: "ADMIN" | "COMMON";
};

export const canAccessTask = (actor: TaskActor, ownerId: string) =>
  actor.role === "ADMIN" || actor.id === ownerId;
