import { NgClass, NgFor, NgIf, NgIfContext } from "@angular/common";
import { Component, DestroyRef, Injectable, OnInit, TemplateRef, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { TaskService } from "../../../../core/services/task.service";
import type { Task, TaskInput, TaskPriority, TaskStatus, TaskUpdate } from "../../../../core/types/task.types";
import { AppButtonComponent } from "src/app/shared/ui/button/app-button.component";
import { AppInputComponent } from "src/app/shared/ui/input/app-input.component";
import { AppSelectComponent, AppSelectOption } from "src/app/shared/ui/select/app-select.component";
import { AppTextareaComponent } from "src/app/shared/ui/textarea/app-textarea.component";

type NotebookFormValue = {
  description: string;
  dueDate: string;
  priority: TaskPriority;
  title: string;
};

@Injectable({
  providedIn: 'root' // Makes it accessible anywhere in the app
})

@Component({
  selector: "app-notebook",
  standalone: true,
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, AppButtonComponent, AppInputComponent, AppSelectComponent, AppTextareaComponent],
  templateUrl: "./notebook.component.html",
  styleUrl: "./notebook.component.css",
})
export class NotebookComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);

  readonly createError = signal("");
  readonly deletePendingId = signal<string | null>(null);
  readonly editingTaskId = signal<string | null>(null);
  readonly error = signal("");
  readonly loading = signal(true);
  readonly savingCreate = signal(false);
  readonly savingEdit = signal(false);
  readonly tasks = signal<Task[]>([]);

  readonly createForm = this.formBuilder.nonNullable.group({
    description: [""],
    dueDate: [""],
    priority: ["MEDIUM" as TaskPriority, Validators.required],
    title: ["", [Validators.minLength(2), Validators.required]],
  });

  readonly editForm = this.formBuilder.nonNullable.group({
    description: [""],
    dueDate: [""],
    priority: ["MEDIUM" as TaskPriority, Validators.required],
    status: ["TODO" as TaskStatus, Validators.required],
    title: ["", [Validators.minLength(2), Validators.required]],
  });

  readonly activeCount = computed(() => this.tasks().filter((task) => task.status !== "ARCHIVED").length);
  readonly hasTasks = computed(() => this.tasks().length > 0);
  emptyState!: TemplateRef<NgIfContext<boolean>> | null;
  editRow!: TemplateRef<NgIfContext<boolean>> | null;
  creatingTask: boolean = false;
  
  readonly priorityOptions: AppSelectOption[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' }
  ];

  toggle() {
    this.creatingTask = !this.creatingTask;
  }

  ngOnInit(): void {
    this.loadTasks();
    this.taskService.connectRealtime();
    this.taskService.taskChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTasks(false));
  }

  createTask(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.savingCreate.set(true);
    this.createError.set("");

    this.taskService.create(this.mapFormToTaskInput(this.createForm.getRawValue())).subscribe({
      error: (error) => {
        this.savingCreate.set(false);
        this.createError.set(error.error?.message ?? "Could not create task");
      },
      next: () => {
        this.savingCreate.set(false);
        this.resetCreateForm();
        this.loadTasks(false);
      },
    });
  }

  startEdit(task: Task): void {
    this.error.set("");
    this.editingTaskId.set(task.id);
    this.editForm.reset({
      description: task.description ?? "",
      dueDate: this.toDateTimeLocalValue(task.dueDate),
      priority: task.priority,
      status: task.status,
      title: task.title,
    });
  }

  cancelEdit(): void {
    this.editingTaskId.set(null);
    this.savingEdit.set(false);
  }

  saveEdit(taskId: string): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.savingEdit.set(true);
    this.error.set("");

    this.taskService.update(taskId, this.mapFormToTaskUpdate(this.editForm.getRawValue())).subscribe({
      error: (error) => {
        this.savingEdit.set(false);
        this.error.set(error.error?.message ?? "Could not update task");
      },
      next: () => {
        this.savingEdit.set(false);
        this.editingTaskId.set(null);
        this.loadTasks(false);
      },
    });
  }

  toggleTaskStatus(task: Task): void {
    const nextStatus: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    this.updateTask(task.id, { status: nextStatus }, "Could not update task");
  }

  archiveTask(task: Task): void {
    const nextStatus: TaskStatus = task.status === "ARCHIVED" ? "TODO" : "ARCHIVED";
    this.updateTask(task.id, { status: nextStatus }, "Could not archive task");
  }

  deleteTask(taskId: string): void {
    this.deletePendingId.set(taskId);
    this.error.set("");

    this.taskService.delete(taskId).subscribe({
      error: (error) => {
        this.deletePendingId.set(null);
        this.error.set(error.error?.message ?? "Could not delete task");
      },
      next: () => {
        if (this.editingTaskId() === taskId) this.editingTaskId.set(null);
        this.deletePendingId.set(null);
        this.loadTasks(false);
      },
    });
  }

  trackTask(_index: number, task: Task): string {
    return task.id;
  }

  priorityLabel(priority: TaskPriority): string {
    return priority.toLowerCase();
  }

  statusLabel(status: TaskStatus): string {
    switch (status) {
      case "IN_PROGRESS":
        return "in progress";
      case "DONE":
        return "done";
      case "ARCHIVED":
        return "archived";
      default:
        return "todo";
    }
  }

  dueDateLabel(dueDate: string | null): string {
    if (!dueDate) return "No due date";

    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
    }).format(new Date(dueDate));
  }

  private loadTasks(showLoader = true): void {
    if (showLoader) this.loading.set(true);

    this.taskService.listAll({}).subscribe({
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.error?.message ?? "Could not load tasks");
      },
      next: (response) => {
        this.loading.set(false);
        this.error.set("");
        this.tasks.set(this.sortTasks(response.data));
      },
    });
  }

  private updateTask(taskId: string, input: TaskUpdate, fallbackMessage: string): void {
    this.error.set("");

    this.taskService.update(taskId, input).subscribe({
      error: (error) => {
        this.error.set(error.error?.message ?? fallbackMessage);
        this.loadTasks(false);
      },
      next: () => this.loadTasks(false),
    });
  }

  private mapFormToTaskInput(value: NotebookFormValue): TaskInput {
    return {
      description: value.description.trim() || null,
      dueDate: value.dueDate ? new Date(value.dueDate).toISOString() : null,
      priority: value.priority,
      title: value.title.trim(),
    };
  }

  private mapFormToTaskUpdate(value: NotebookFormValue & { status: TaskStatus }): TaskUpdate {
    return {
      ...this.mapFormToTaskInput(value),
      status: value.status,
    };
  }

  private resetCreateForm(): void {
    this.createForm.reset({
      description: "",
      dueDate: "",
      priority: "MEDIUM",
      title: "",
    });
  }

  private sortTasks(tasks: Task[]): Task[] {
    const statusOrder: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 1,
      DONE: 2,
      ARCHIVED: 3,
    };

    return [...tasks].sort((left, right) => {
      const statusDifference = statusOrder[left.status] - statusOrder[right.status];

      if (statusDifference !== 0) return statusDifference;

      if (left.dueDate && right.dueDate) {
        const dueDateDifference = new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
        if (dueDateDifference !== 0) return dueDateDifference;
      }

      if (left.dueDate) return -1;
      if (right.dueDate) return 1;

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }

  private toDateTimeLocalValue(value: string | null): string {
    if (!value) return "";

    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 16);
  }
}
