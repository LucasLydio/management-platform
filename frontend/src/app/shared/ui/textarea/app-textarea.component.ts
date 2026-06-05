import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-textarea",
  standalone: true,
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppTextareaComponent),
    },
  ],
  template: `
    <label class="app-field" [class.app-field--disabled]="disabled">
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
        (blur)="markAsTouched()"
        (input)="handleInput($any($event.target).value)"
      ></textarea>
    </label>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .app-field {
        display: grid;
        gap: 0.45rem;
        width: 100%;
      }

      .app-field__label {
        color: #334155;
        font-weight: 800;
      }

      .app-textarea {
        width: 100%;
        font-family: inherit;
        font-size: inherit;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid #cbd5e1;
        border-radius: 0.9rem;
        color: #1e293b;
        min-height: 6rem;
        padding: 0.75rem 1rem;
        resize: vertical;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          transform 0.2s ease;
      }

      .app-textarea:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
        outline: none;
      }

      .app-textarea:disabled {
        cursor: not-allowed;
        opacity: 0.6;
        background-color: #f8fafc;
      }

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
export class AppTextareaComponent implements ControlValueAccessor {
  @Input() disabled = false;
  @Input() form = "";
  @Input() label = "";
  @Input() placeholder = "";
  @Input() rows = 3; // Default height
  @Input() value = "";
  @Input() variant: "primary" | "ghost" = "primary";

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? "";
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  markAsTouched(): void {
    this.onTouched();
  }
}
