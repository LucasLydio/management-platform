import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { io, type Socket } from "socket.io-client";

import { environment } from "../../../environments/environment";
import type { ApiResponse, PaginatedResponse } from "../types/api.types";
import type { Task, TaskInput, TaskStatus, TaskUpdate } from "../types/task.types";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class TaskService {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly taskChangedSubject = new Subject<Task | { deleted: true; id: string }>();
  private socket?: Socket;

  readonly taskChanged$ = this.taskChangedSubject.asObservable();

  list(filters: {
    limit?: number;
    page?: number;
    search?: string;
    status?: TaskStatus | "";
  }): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams()
      .set("limit", String(filters.limit ?? 10))
      .set("page", String(filters.page ?? 1));

    params = filters.search ? params.set("search", filters.search) : params;
    params = filters.status ? params.set("status", filters.status) : params;

    return this.http.get<PaginatedResponse<Task>>(`${environment.apiUrl}/tasks`, { params });
  }

  create(input: TaskInput): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${environment.apiUrl}/tasks`, input);
  }

  update(id: string, input: TaskUpdate): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${environment.apiUrl}/tasks/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${id}`);
  }

  connectRealtime(): void {
    if (this.socket?.connected) return;

    const token = this.authService.token();
    if (!token) return;

    this.socket = io(environment.socketUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    this.socket.on("task.changed", (task: Task | { deleted: true; id: string }) => {
      this.taskChangedSubject.next(task);
    });
  }
}

