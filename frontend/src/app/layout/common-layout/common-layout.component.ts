import { NgIf } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

import { AuthService } from "../../core/services/auth.service";
import { ThemeService } from "../../core/services/theme.service";
import { AppButtonComponent } from "../../shared/ui/button/app-button.component";

@Component({
  selector: "app-common-layout",
  standalone: true,
  imports: [AppButtonComponent, NgIf, RouterLink, RouterOutlet],
  templateUrl: "./common-layout.component.html",
  styleUrl: "./common-layout.component.scss",
})
export class CommonLayoutComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
}

