import { Component, EventEmitter, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import type { TaskInput, TaskPriority } from "../../../../core/types/task.types";
import { AppButtonComponent } from "../../../../shared/ui/button/app-button.component";

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [AppButtonComponent, ReactiveFormsModule],
  templateUrl: "./task-form.component.html",
  styleUrl: "./task-form.component.scss",
})
export class TaskFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  @Output() taskCreated = new EventEmitter<TaskInput>();

  readonly form = this.formBuilder.nonNullable.group({
    description: [""],
    dueDate: [""],
    priority: ["MEDIUM" as TaskPriority, Validators.required],
    title: ["", [Validators.minLength(2), Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    this.taskCreated.emit({
      description: value.description || null,
      dueDate: value.dueDate ? new Date(value.dueDate).toISOString() : null,
      priority: value.priority,
      title: value.title,
    });

    this.form.reset({ description: "", dueDate: "", priority: "MEDIUM", title: "" });
  }
}
