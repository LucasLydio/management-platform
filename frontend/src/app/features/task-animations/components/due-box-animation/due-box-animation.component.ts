import { Component } from "@angular/core";

@Component({
  selector: "app-due-box-animation",
  standalone: true,
  template: `
    <div class="due-box" aria-hidden="true">
      <span></span>
    </div>
  `,
  styleUrl: "./due-box-animation.component.scss",
})
export class DueBoxAnimationComponent {}

