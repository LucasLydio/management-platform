import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export type AppSelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

@Component({
  selector: "app-select",
  standalone: true,
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
    },
  ],
  template: `
    <label class="app-field" [class.app-field--disabled]="isDisabled">
      @if (label) {
        <span class="app-field__label">{{ label }}</span>
      }

      <select
        class="app-field__control"
        [attr.id]="selectId"
        [attr.name]="name"
        [disabled]="isDisabled"
        [value]="value"
        (blur)="markAsTouched()"
        (change)="handleChange($any($event.target).value)"
      >
        @for (option of options; track option.value) {
          <option [disabled]="option.disabled" [value]="option.value">
            {{ option.label }}
          </option>
        }
      </select>

      @if (hint) {
        <small class="app-field__hint">{{ hint }}</small>
      }
    </label>
  `,
  styleUrl: "./app-select.component.scss",
})
export class AppSelectComponent implements ControlValueAccessor {
  @Input() hint = "";
  @Input() label = "";
  @Input() name = "";
  @Input() options: AppSelectOption[] = [];
  @Input() selectId = "";

  isDisabled = false;
  value = "";

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
    this.isDisabled = isDisabled;
  }

  handleChange(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  markAsTouched(): void {
    this.onTouched();
  }
}

