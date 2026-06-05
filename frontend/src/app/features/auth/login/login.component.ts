import { NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";

import { AuthService } from "../../../core/services/auth.service";
import { AppInputComponent } from "../../../shared/ui/input/app-input.component";
import { GoogleSigninComponent } from "../components/google-signin/google-signin.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    AppInputComponent,
    GoogleSigninComponent,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "../auth.scss",
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly error = signal("");
  readonly loading = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    email: ["", [Validators.email, Validators.required]],
    password: ["", [Validators.minLength(8), Validators.required]],
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
}
