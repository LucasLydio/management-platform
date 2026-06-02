import { DatePipe, NgClass, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import type { Task, TaskStatus } from "../../../../core/types/task.types";
import { AppButtonComponent } from "../../../../shared/ui/button/app-button.component";

@Component({
  selector: "app-task-card",
  standalone: true,
  imports: [AppButtonComponent, DatePipe, NgClass, NgIf],
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.scss",
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() deleteTask = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ id: string; status: TaskStatus }>();

  nextStatus(status: TaskStatus): TaskStatus {
    const flow: Record<TaskStatus, TaskStatus> = {
      DONE: "TODO",
      IN_PROGRESS: "DONE",
      TODO: "IN_PROGRESS",
    };

    return flow[status];
  }
}

