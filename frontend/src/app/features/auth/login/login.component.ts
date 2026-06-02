import { NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

import { AuthService } from "../../../core/services/auth.service";
import { AppButtonComponent } from "../../../shared/ui/button/app-button.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [AppButtonComponent, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "../auth.scss",
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly error = signal("");
  readonly loading = signal(false);
  readonly googleToken = signal("");

  readonly form = this.formBuilder.nonNullable.group({
    email: ["admin@management.local", [Validators.email, Validators.required]],
    password: ["Admin@12345", [Validators.minLength(8), Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set("");

    this.authService.login(this.form.getRawValue()).subscribe({
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.error?.message ?? "Could not login");
      },
      next: () => void this.router.navigateByUrl("/"),
    });
  }

  submitGoogle(): void {
    if (!this.googleToken()) return;

    this.loading.set(true);
    this.error.set("");

    this.authService.googleLogin(this.googleToken()).subscribe({
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.error?.message ?? "Google login failed");
      },
      next: () => void this.router.navigateByUrl("/"),
    });
  }
}

