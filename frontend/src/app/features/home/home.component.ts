import { AsyncPipe, DOCUMENT, NgClass, NgFor, NgIf } from "@angular/common";
import { CdkDragDrop, DragDropModule } from "@angular/cdk/drag-drop";
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { BehaviorSubject, catchError, switchMap, tap, throwError } from "rxjs";

import { TaskService } from "../../core/services/task.service";
import type { Task, TaskInput, TaskStatus } from "../../core/types/task.types";
import { RevealOnViewDirective } from "../../shared/directives/reveal-on-view.directive";
import { AppButtonComponent } from "../../shared/ui/button/app-button.component";
import { AppInputComponent } from "../../shared/ui/input/app-input.component";
import { AppSelectComponent, type AppSelectOption } from "../../shared/ui/select/app-select.component";
import { DueBoxAnimationComponent } from "../task-animations/components/due-box-animation/due-box-animation.component";
import { NewTaskShelfAnimationComponent } from "../task-animations/components/new-task-shelf-animation/new-task-shelf-animation.component";
import { PendingAlertAnimationComponent } from "../task-animations/components/pending-alert-animation/pending-alert-animation.component";
import { TaskFormComponent } from "./components/task-form/task-form.component";
import { NotebookComponent } from "./components/notebook/notebook.component";

type TaskColumn = {
  description: string;
  label: string;
  status: TaskStatus;
};

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    AppButtonComponent,
    AppInputComponent,
    AppSelectComponent,
    AsyncPipe,
    DragDropModule,
    DueBoxAnimationComponent,
    NewTaskShelfAnimationComponent,
    NgFor,
    NgIf,
    NgClass,
    PendingAlertAnimationComponent,
    ReactiveFormsModule,
    RevealOnViewDirective,
    TaskFormComponent,
    NotebookComponent
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild("addTaskButton") private addTaskButton?: ElementRef<HTMLButtonElement>;
  @ViewChild(TaskFormComponent) private taskForm?: TaskFormComponent;

  private readonly document = inject(DOCUMENT);
  private readonly formBuilder = inject(FormBuilder);
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);

  readonly createTaskError = signal("");
  readonly creatingTask = signal(false);
  readonly error = signal("");
  readonly filters = this.formBuilder.nonNullable.group({
    search: [""],
    status: ["" as TaskStatus | ""],
  });
  readonly createTaskForm = inject(NotebookComponent);
  
  readonly columns: TaskColumn[] = [
    {
      description: "New ideas and incoming work.",
      label: "Queue",
      status: "TODO",
    },
    {
      description: "Tasks needing focus soon.",
      label: "In progress",
      status: "IN_PROGRESS",
    },
    {
      description: "Completed and ready to review.",
      label: "Done",
      status: "DONE",
    },
    {
      description: "Hidden from active work, easy to restore.",
      label: "Archived box",
      status: "ARCHIVED",
    },
  ];
  readonly statusOptions: AppSelectOption[] = [
    { label: "All status", value: "" },
    { label: "Todo", value: "TODO" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Done", value: "DONE" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  readonly tasks$ = this.refreshSubject.pipe(
    switchMap(() =>
      this.taskService.listAll({
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
    this.taskService.taskChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.unlockBackgroundScroll();
  }

  createTask(input: TaskInput): void {
    this.creatingTask.set(true);
    this.createTaskError.set("");

    this.taskService.create(input).subscribe({
      error: (error) => {
        this.creatingTask.set(false);
        this.createTaskError.set(error.error?.message ?? "Could not create task");
      },
      next: () => {
        this.creatingTask.set(false);
        this.taskForm?.reset();
        this.closeCreateTaskModal();
        this.refresh();
      },
    });
  }

  openCreateTaskModal(): void {
    this.createTaskError.set("");
    this.document.body.classList.add("is-task-modal-open");
    this.isCreateTaskModalOpen.set(true);
  }

  closeCreateTaskModal(): void {
    if (this.creatingTask()) return;

    this.isCreateTaskModalOpen.set(false);
    this.createTaskError.set("");
    this.unlockBackgroundScroll();
    queueMicrotask(() => this.addTaskButton?.nativeElement.focus());
  }

  @HostListener("document:keydown.escape")
  closeModalOnEscape(): void {
    if (this.isCreateTaskModalOpen()) this.closeCreateTaskModal();
  }

  isCreateSubmitDisabled(): boolean {
    return this.creatingTask() || Boolean(this.taskForm?.form.invalid);
  }

  updateStatus(input: { id: string; status: TaskStatus }): void {
    this.taskService.update(input.id, { status: input.status }).subscribe({
      error: (error) => {
        this.error.set(error.error?.message ?? "Could not update task");
        this.refresh();
      },
      next: () => this.refresh(),
    });
  }

  dropTask(event: CdkDragDrop<TaskStatus>): void {
    const task = event.item.data as Task;
    const nextStatus = event.container.data;

    if (task.status === nextStatus) return;

    this.updateStatus({ id: task.id, status: nextStatus });
  }

  tasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
    return tasks.filter((task) => task.status === status);
  }

  trackTask(_index: number, task: Task): string {
    return task.id;
  }

  trackColumn(_index: number, column: TaskColumn): TaskStatus {
    return column.status;
  }

  deleteTask(id: string): void {
    this.taskService.delete(id).subscribe({
      error: (error) => this.error.set(error.error?.message ?? "Could not delete task"),
      next: () => this.refresh(),
    });
  }

  applyFilters(): void {
    this.refresh();
  }

  private refresh(): void {
    this.refreshSubject.next();
  }

  readonly isCreateTaskModalOpen = signal(false);

  private unlockBackgroundScroll(): void {
    this.document.body.classList.remove("is-task-modal-open");
  }
}
