import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

import { AuthService } from "../services/auth.service";

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const shouldRedirect = error.status === 401 && !request.url.includes("/auth/login");

      if (shouldRedirect) {
        authService.logout();
        void router.navigateByUrl("/auth/login");
      }

      return throwError(() => error);
    }),
  );
};

