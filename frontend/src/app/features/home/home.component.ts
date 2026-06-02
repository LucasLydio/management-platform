import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { BehaviorSubject, catchError, switchMap, tap, throwError } from "rxjs";

import { TaskService } from "../../core/services/task.service";
import type { PaginatedResponse } from "../../core/types/api.types";
import type { Task, TaskInput, TaskStatus } from "../../core/types/task.types";
import { AppButtonComponent } from "../../shared/ui/button/app-button.component";
import { TaskCardComponent } from "./components/task-card/task-card.component";
import { TaskFormComponent } from "./components/task-form/task-form.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    AppButtonComponent,
    AsyncPipe,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    TaskCardComponent,
    TaskFormComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);
  private readonly taskService = inject(TaskService);

  readonly error = signal("");
  readonly filters = this.formBuilder.nonNullable.group({
    search: [""],
    status: ["" as TaskStatus | ""],
  });
  readonly page = signal(1);

  readonly tasks$ = this.refreshSubject.pipe(
    switchMap(() =>
      this.taskService.list({
        page: this.page(),
        search: this.filters.controls.search.value,
        status: this.filters.controls.status.value,
      }),
    ),
    tap(() => this.error.set("")),
    catchError((error) => {
      this.error.set(error.error?.message ?? "Could not load tasks");
      return throwError(() => error);
    }),
  );

  ngOnInit(): void {
    this.taskService.connectRealtime();
    this.taskService.taskChanged$.subscribe(() => this.refresh());
  }

  createTask(input: TaskInput): void {
    this.taskService.create(input).subscribe({
      error: (error) => this.error.set(error.error?.message ?? "Could not create task"),
      next: () => this.refresh(),
    });
  }

  updateStatus(input: { id: string; status: TaskStatus }): void {
    this.taskService.update(input.id, { status: input.status }).subscribe({
      error: (error) => this.error.set(error.error?.message ?? "Could not update task"),
      next: () => this.refresh(),
    });
  }

  deleteTask(id: string): void {
    this.taskService.delete(id).subscribe({
      error: (error) => this.error.set(error.error?.message ?? "Could not delete task"),
      next: () => this.refresh(),
    });
  }

  applyFilters(): void {
    this.page.set(1);
    this.refresh();
  }

  nextPage(response: PaginatedResponse<Task>): void {
    if (!response.meta.hasNextPage) return;
    this.page.update((page) => page + 1);
    this.refresh();
  }

  previousPage(response: PaginatedResponse<Task>): void {
    if (!response.meta.hasPreviousPage) return;
    this.page.update((page) => page - 1);
    this.refresh();
  }

  private refresh(): void {
    this.refreshSubject.next();
  }
}

