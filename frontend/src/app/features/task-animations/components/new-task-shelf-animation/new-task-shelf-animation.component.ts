import { Component } from "@angular/core";

@Component({
  selector: "app-new-task-shelf-animation",
  standalone: true,
  template: `
    <div class="mini-animation mini-animation--queue" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `,
  styleUrl: "./new-task-shelf-animation.component.scss",
})
export class NewTaskShelfAnimationComponent {}

