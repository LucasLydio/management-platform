import { NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";

import { AuthService } from "../../../../core/services/auth.service";
import { GoogleIdentityService } from "../../../../core/services/google-identity.service";

@Component({
  selector: "app-google-signin",
  standalone: true,
  imports: [NgIf],
  templateUrl: "./google-signin.component.html",
  styleUrl: "./google-signin.component.scss",
})
export class GoogleSigninComponent implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly googleIdentityService = inject(GoogleIdentityService);
  private readonly router = inject(Router);

  readonly buttonHost = viewChild.required<ElementRef<HTMLDivElement>>("buttonHost");
  readonly context = input<"signin" | "signup">("signin");
  readonly error = signal("");
  readonly isAvailable = signal(false);
  readonly loading = signal(true);
  readonly submitting = signal(false);

  ngAfterViewInit(): void {
    this.authService
      .googleConfig()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.loading.set(false);
          this.error.set("Google sign-in is unavailable right now.");
        },
        next: ({ data }) => {
          if (!data.enabled || !data.clientId) {
            this.loading.set(false);
            this.isAvailable.set(false);
            return;
          }

          void this.mountButton(data.clientId);
        },
      });
  }

  private async mountButton(clientId: string): Promise<void> {
    try {
      await this.googleIdentityService.renderButton({
        clientId,
        context: this.context(),
        host: this.buttonHost().nativeElement,
        onCredential: (credential) => this.completeGoogleSignIn(credential),
      });

      this.isAvailable.set(true);
      this.loading.set(false);
    } catch {
      this.loading.set(false);
      this.error.set("Google sign-in could not be initialized.");
    }
  }

  private completeGoogleSignIn(idToken: string): void {
    if (!idToken) return;

    this.submitting.set(true);
    this.error.set("");

    this.authService.googleLogin(idToken).subscribe({
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(error.error?.message ?? "Google sign-in failed");
      },
      next: () => void this.router.navigateByUrl("/"),
    });
  }
}
