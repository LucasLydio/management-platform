import { Component, Input } from "@angular/core";

@Component({
  selector: "app-textarea",
  standalone: true,
  template: `
    <label class="app-field" [class.app-field--disabled]="isDisabled">
      @if (label) {
        <span class="app-field__label">{{ label }}</span>
      }
    <textarea
      class="app-textarea"
      [attr.form]="form || null"
      [class.app-textarea--ghost]="variant === 'ghost'"
      [disabled]="disabled"
      [placeholder]="placeholder"
      [rows]="rows"
      [value]="value"
    ></textarea>
  `,
  styles: [
    `
      .app-textarea {
        width: 100%;
        font-family: inherit;
        font-size: inherit;
        background: transparent;
        border: 1px solid #cbd5e1; /* Added a subtle default border suitable for a textarea */
        border-radius: 0.375rem;
        color: #1e293b;
        padding: 0.5rem;
        resize: vertical; /* Allows user to resize vertically but not break layout horizontally */
      }

      .app-textarea:focus {
        outline: 2px solid #4f46e5;
        outline-offset: -1px;
      }

      .app-textarea:disabled {
        cursor: not-allowed;
        opacity: 0.6;
        background-color: #f8fafc;
      }

      /* Ghost variant to match your button style */
      .app-textarea--ghost {
        border-color: transparent;
        background: transparent;
        color: #3730a3;
      }
      
      .app-textarea--ghost:focus {
        outline: 1px solid #3730a3;
      }
    `,
  ],
})
export class AppTextareaComponent {
  @Input() disabled = false;
  @Input() form = "";
  @Input() label = "";
  @Input() placeholder = "";
  @Input() rows = 3; // Default height
  @Input() value = "";
  @Input() variant: "primary" | "ghost" = "primary";

  isDisabled = false;
}