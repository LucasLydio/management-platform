import { DatePipe, NgClass, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import type { Task, TaskStatus } from "../../../../core/types/task.types";
import { RevealOnViewDirective } from "../../../../shared/directives/reveal-on-view.directive";

@Component({
  selector: "app-task-card",
  standalone: true,
  imports: [DatePipe, NgClass, NgIf, RevealOnViewDirective],
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.scss",
})
export class TaskCardComponent {
  @Input() motionIndex = 0;
  @Input({ required: true }) task!: Task;
  @Output() deleteTask = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ id: string; status: TaskStatus }>();

  nextStatus(status: TaskStatus): TaskStatus {
    const flow: Record<TaskStatus, TaskStatus> = {
      ARCHIVED: "TODO",
      DONE: "ARCHIVED",
      IN_PROGRESS: "DONE",
      TODO: "IN_PROGRESS",
    };

    return flow[status];
  }

  actionLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      ARCHIVED: "Restore to todo",
      DONE: "Archive task",
      IN_PROGRESS: "Mark as done",
      TODO: "Start task",
    };

    return labels[status];
  }

  actionIcon(status: TaskStatus): string {
    const icons: Record<TaskStatus, string> = {
      ARCHIVED: "bi-arrow-counterclockwise",
      DONE: "bi-archive",
      IN_PROGRESS: "bi-check2-circle",
      TODO: "bi-play-circle",
    };

    return icons[status];
  }

  priorityIcon(priority: Task["priority"]): string {
    const icons: Record<Task["priority"], string> = {
      HIGH: "bi-lightning-charge-fill",
      LOW: "bi-arrow-down-circle",
      MEDIUM: "bi-record-circle",
    };

    return icons[priority];
  }

  priorityLabel(priority: Task["priority"]): string {
    const labels: Record<Task["priority"], string> = {
      HIGH: "High impact",
      LOW: "Low pressure",
      MEDIUM: "Medium focus",
    };

    return labels[priority];
  }

  statusIcon(status: TaskStatus): string {
    const icons: Record<TaskStatus, string> = {
      ARCHIVED: "bi-archive",
      DONE: "bi-check2-circle",
      IN_PROGRESS: "bi-hourglass-split",
      TODO: "bi-inbox",
    };

    return icons[status];
  }

  statusLabel(status: TaskStatus): string {
    return status.replace("_", " ");
  }

  isDue(task: Task): boolean {
    return (
      task.status !== "DONE" &&
      task.status !== "ARCHIVED" &&
      Boolean(task.dueDate) &&
      new Date(task.dueDate!).getTime() < Date.now()
    );
  }

  visualState(task: Task): "archived" | "completed" | "due" | "pending" | "new" {
    if (task.status === "ARCHIVED") return "archived";
    if (task.status === "DONE") return "completed";
    if (this.isDue(task)) return "due";
    return task.status === "IN_PROGRESS" ? "pending" : "new";
  }
}
