import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const appRoutes: Routes = [
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./layout/common-layout/common-layout.component").then(
        (m) => m.CommonLayoutComponent,
      ),
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/home/home.routes").then((m) => m.homeRoutes),
      },
    ],
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.authRoutes),
  },

  { path: "login", pathMatch: "full", redirectTo: "auth/login" },
  { path: "**", redirectTo: "auth/login" },
];
