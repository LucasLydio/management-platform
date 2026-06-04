import { Component, Input } from "@angular/core";

@Component({
  selector: "app-button",
  standalone: true,
  template: `
    <button
      class="app-button"
      [attr.form]="form || null"
      [class.app-button--ghost]="variant === 'ghost'"
      [disabled]="disabled"
      [type]="type"
    >
      <ng-content />
    </button>
  `,
  styles: [
    `
      .app-button {
        align-items: center;
        background: transparent;
        border: 0;
        color: #4f46e5;
        cursor: pointer;
        display: inline-flex;
        gap: 0.5rem;
        justify-content: center;
        padding: .4rem;
      }

      .app-button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .app-button--ghost {
        color: #3730a3;
      }
    `,
  ],
})
export class AppButtonComponent {
  @Input() disabled = false;
  @Input() form = "";
  @Input() type: "button" | "number" | "date" | "submit" = "button" ;
  @Input() variant: "primary" | "ghost" = "primary";
}
