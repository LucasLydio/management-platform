import { NgClass } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [NgClass],
  template: `
    <button class="app-button" [class.app-button--ghost]="variant === 'ghost'" [disabled]="disabled" [type]="type">
      <ng-content />
    </button>
  `,
  styles: [
    `
      .app-button {
        align-items: center;
        background: linear-gradient(135deg, #4f46e5, #06b6d4);
        border: 0;
        border-radius: 0.9rem;
        color: #fff;
        cursor: pointer;
        display: inline-flex;
        font-weight: 700;
        gap: 0.5rem;
        justify-content: center;
        min-height: 2.75rem;
        padding: 0.75rem 1rem;
      }

      .app-button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .app-button--ghost {
        background: rgba(79, 70, 229, 0.1);
        color: #3730a3;
      }
    `,
  ],
})
export class AppButtonComponent {
  @Input() disabled = false;
  @Input() type: "button" | "submit" = "button";
  @Input() variant: "primary" | "ghost" = "primary";
}

