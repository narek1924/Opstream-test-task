import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  Optional,
  Self,
  input,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { FieldType } from '../../models/request-schema';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputFieldComponent implements ControlValueAccessor, OnDestroy {
  label = input('');
  type = input<FieldType>('text');
  options = input<string[]>([]);
  hint = input('');
  name = input('');
  dropdownOpen = signal(false);

  value: any;
  touched = false;
  disabled = false;

  private onChange: (_: any) => void = () => {};
  private onTouched: () => void = () => {};
  private readonly destroy$ = new Subject<void>();

  constructor(@Self() @Optional() public ngControl: NgControl | null) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(value: any): void {
    if (this.type() === 'number' && value !== null && value !== undefined && value !== '') {
      this.value = Number(value);
    } else if (this.type() === 'toggle') {
      this.value = Boolean(value);
    } else {
      this.value = value;
    }
    this.onChange(this.value);
  }

  toggleDropdown(event: Event): void {
    if (this.type() !== 'dropdown' || this.disabled) {
      return;
    }
    event.stopPropagation();
    this.dropdownOpen.set(!this.dropdownOpen());
    this.markTouched();
  }

  selectOption(option: string): void {
    this.handleChange(option);
    this.dropdownOpen.set(false);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    if (this.dropdownOpen()) {
      this.dropdownOpen.set(false);
    }
  }

  markTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  get invalid(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get errorMessage(): string | null {
    if (!this.invalid) {
      return null;
    }
    const control = this.ngControl?.control;
    if (!control) {
      return null;
    }
    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('requiredTrue')) {
      return 'This field must be enabled.';
    }
    return 'Invalid value.';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
