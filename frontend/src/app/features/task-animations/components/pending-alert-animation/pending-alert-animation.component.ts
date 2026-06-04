import { Component } from "@angular/core";

@Component({
  selector: "app-pending-alert-animation",
  standalone: true,
  template: `
    <div class="pending-alert" aria-hidden="true">
      <span>!</span>
    </div>
  `,
  styleUrl: "./pending-alert-animation.component.scss",
})
export class PendingAlertAnimationComponent {}

