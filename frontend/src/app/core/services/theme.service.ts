import { DOCUMENT } from "@angular/common";
import { Injectable, inject, signal } from "@angular/core";

type Theme = "dark" | "light";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly themeSignal = signal<Theme>(
    (localStorage.getItem("management_theme") as Theme | null) ?? "light",
  );

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  toggle(): void {
    const nextTheme = this.themeSignal() === "dark" ? "light" : "dark";
    localStorage.setItem("management_theme", nextTheme);
    this.themeSignal.set(nextTheme);
    this.applyTheme(nextTheme);
  }

  private applyTheme(theme: Theme): void {
    this.document.documentElement.dataset["theme"] = theme;
  }
}

