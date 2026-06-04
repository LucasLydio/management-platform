import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import type { TaskInput, TaskPriority } from "../../../../core/types/task.types";
import { AppButtonComponent } from "../../../../shared/ui/button/app-button.component";
import { AppInputComponent } from "../../../../shared/ui/input/app-input.component";
import { AppSelectComponent, type AppSelectOption } from "../../../../shared/ui/select/app-select.component";

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [AppButtonComponent, AppInputComponent, AppSelectComponent, ReactiveFormsModule],
  templateUrl: "./task-form.component.html",
  styleUrl: "./task-form.component.scss",
})
export class TaskFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  @Input() formId = "task-form";
  @Input() showActions = true;
  @Output() taskCreated = new EventEmitter<TaskInput>();

  readonly priorityOptions: AppSelectOption[] = [
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
  ];

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
  }

  reset(): void {
    this.form.reset({ description: "", dueDate: "", priority: "MEDIUM", title: "" });
  }
}
