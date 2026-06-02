import { NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

import { AuthService } from "../../../core/services/auth.service";
import { AppButtonComponent } from "../../../shared/ui/button/app-button.component";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [AppButtonComponent, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: "./register.component.html",
  styleUrl: "../auth.scss",
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly error = signal("");
  readonly loading = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    email: ["", [Validators.email, Validators.required]],
    name: ["", [Validators.minLength(2), Validators.required]],
    password: ["", [Validators.minLength(8), Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set("");

    this.authService.register(this.form.getRawValue()).subscribe({
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.error?.message ?? "Could not create account");
      },
      next: () => void this.router.navigateByUrl("/"),
    });
  }
}

