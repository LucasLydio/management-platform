import { Component, EventEmitter, Input, Output, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export type AppInputType =
  | "date"
  | "datetime-local"
  | "email"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url";

@Component({
  selector: "app-input",
  standalone: true,
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
    },
  ],
  template: `
    <label class="app-field" [class.app-field--disabled]="isDisabled">
      @if (label) {
        <span class="app-field__label">{{ label }}</span>
      }

      @if (multiline) {
        <textarea
          class="app-field__control app-field__control--textarea"
          [attr.autocomplete]="autocomplete"
          [attr.id]="inputId"
          [attr.name]="name"
          [attr.placeholder]="placeholder"
          [attr.rows]="rows"
          [disabled]="isDisabled"
          [value]="value ?? ''"
          (blur)="markAsTouched()"
          (input)="handleInput($any($event.target).value)"
        ></textarea>
      } @else {
        <input
          class="app-field__control"
          [attr.autocomplete]="autocomplete"
          [attr.id]="inputId"
          [attr.max]="max"
          [attr.min]="min"
          [attr.name]="name"
          [attr.placeholder]="placeholder"
          [attr.step]="step"
          [disabled]="isDisabled"
          [type]="type"
          [value]="value ?? ''"
          (blur)="markAsTouched()"
          (input)="handleInput($any($event.target).value)"
        />
      }

      @if (hint) {
        <small class="app-field__hint">{{ hint }}</small>
      }
    </label>
  `,
  styleUrl: "./app-input.component.scss",
})
export class AppInputComponent implements ControlValueAccessor {
  @Input() autocomplete = "";
  @Input() hint = "";
  @Input() inputId = "";
  @Input() label = "";
  @Input() max: number | string | null = null;
  @Input() min: number | string | null = null;
  @Input() multiline = false;
  @Input() name = "";
  @Input() placeholder = "";
  @Input() rows = 3;
  @Input() step: number | string | null = null;
  @Input() type: AppInputType = "text";
  @Input() value: number | string | null = "";

  @Output() valueChange = new EventEmitter<number | string | null>();

  isDisabled = false;

  private onChange: (value: number | string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | string | null): void {
    this.value = value ?? "";
  }

  registerOnChange(onChange: (value: number | string | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  handleInput(rawValue: string): void {
    const value = this.type === "number" ? this.normalizeNumber(rawValue) : rawValue;
    this.value = value;
    this.valueChange.emit(value);
    this.onChange(value);
  }

  markAsTouched(): void {
    this.onTouched();
  }

  private normalizeNumber(value: string): number | null {
    return value === "" ? null : Number(value);
  }
}

