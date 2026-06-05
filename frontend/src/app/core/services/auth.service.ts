import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, shareReplay, tap } from "rxjs";

import { environment } from "../../../environments/environment";
import type { GoogleAuthProviderConfig } from "../types/auth.types";
import type { ApiResponse } from "../types/api.types";
import type { AuthSession, User } from "../types/user.types";

const TOKEN_KEY = "management_access_token";
const USER_KEY = "management_user";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly userSignal = signal<User | null>(this.readUser());
  private readonly googleConfigRequest$ = this.http
    .get<ApiResponse<GoogleAuthProviderConfig>>(`${environment.apiUrl}/auth/google/config`)
    .pipe(shareReplay(1));

  readonly currentUser = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => Boolean(this.tokenSignal() && this.userSignal()));

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthSession>> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiUrl}/auth/login`, credentials, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.persistSession(response.data)));
  }

  register(input: { email: string; name: string; password: string }): Observable<ApiResponse<AuthSession>> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiUrl}/auth/register`, input, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.persistSession(response.data)));
  }

  googleLogin(idToken: string): Observable<ApiResponse<AuthSession>> {
    return this.http
      .post<ApiResponse<AuthSession>>(
        `${environment.apiUrl}/auth/google`,
        { idToken },
        { withCredentials: true },
      )
      .pipe(tap((response) => this.persistSession(response.data)));
  }

  googleConfig(): Observable<ApiResponse<GoogleAuthProviderConfig>> {
    return this.googleConfigRequest$;
  }

  refresh(): Observable<ApiResponse<AuthSession>> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiUrl}/auth/refresh`, null, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.persistSession(response.data)));
  }

  me(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`, {
      withCredentials: true,
    });
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}/auth/logout`, null, { withCredentials: true })
      .subscribe({ error: () => undefined });
    this.clearSession();
    void this.router.navigateByUrl("/auth/login");
  }

  token(): string | null {
    return this.tokenSignal();
  }

  private persistSession(session: AuthSession): void {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    this.tokenSignal.set(session.accessToken);
    this.userSignal.set(session.user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private readUser(): User | null {
    const value = localStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as User) : null;
  }
}
