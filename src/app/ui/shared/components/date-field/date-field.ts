import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-date-field',
  standalone: true,
  templateUrl: './date-field.html',
  styleUrl: './date-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateFieldComponent),
      multi: true
    }
  ]
})
export class DateFieldComponent implements ControlValueAccessor {

  readonly hint = input('Selecciona la fecha');

  readonly withTime = input(false);

  readonly day = signal('');

  readonly month = signal('');

  readonly year = signal('');

  readonly time = signal('');

  readonly disabled = signal(false);

  readonly months = Array.from({ length: 12 }, (_, index) => {
    const value = `${index + 1}`.padStart(2, '0');
    return { value };
  });

  private onChange: (value: string) => void = () => {};

  private onTouched: () => void = () => {};

  private syncing = false;

  writeValue(value: string | null): void {

    this.syncing = true;
    this.parse(value ?? '');
    this.syncing = false;

  }

  registerOnChange(fn: (value: string) => void): void {

    this.onChange = fn;

  }

  registerOnTouched(fn: () => void): void {

    this.onTouched = fn;

  }

  setDisabledState(isDisabled: boolean): void {

    this.disabled.set(isDisabled);

  }

  onDayInput(value: string): void {

    this.day.set(value.replace(/\D/g, '').slice(0, 2));
    this.emit();

  }

  onMonthChange(value: string): void {

    this.month.set(value);
    this.emit();

  }

  onYearInput(value: string): void {

    this.year.set(value.replace(/\D/g, '').slice(0, 4));
    this.emit();

  }

  onTimeInput(value: string): void {

    this.time.set(value);
    this.emit();

  }

  blur(): void {

    this.onTouched();

  }

  private emit(): void {

    if (this.syncing) {
      return;
    }

    const day = Number(this.day());
    const month = Number(this.month());
    const year = Number(this.year());
    const complete =
      this.day().length > 0 &&
      this.month().length === 2 &&
      this.year().length === 4 &&
      month >= 1 &&
      month <= 12 &&
      year >= 1900 &&
      day >= 1 &&
      day <= this.daysInMonth(year, month);

    if (!complete) {
      this.onChange('');
      return;
    }

    const iso =
      `${this.year()}-` +
      `${this.month()}-` +
      `${this.day().padStart(2, '0')}`;

    if (this.withTime()) {
      const time = this.time() || '00:00';
      this.onChange(`${iso}T${time}`);
      return;
    }

    this.onChange(iso);

  }

  private parse(raw: string): void {

    const value = raw.trim();

    if (!value) {
      this.day.set('');
      this.month.set('');
      this.year.set('');
      this.time.set('');
      return;
    }

    const iso = value.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/
    );

    if (iso) {
      this.year.set(iso[1]);
      this.month.set(iso[2]);
      this.day.set(String(Number(iso[3])));
      this.time.set(iso[4] ? `${iso[4]}:${iso[5]}` : '');
      return;
    }

    const latam = value.match(
      /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/
    );

    if (latam) {
      this.day.set(String(Number(latam[1])));
      this.month.set(latam[2]);
      this.year.set(latam[3]);
      this.time.set(latam[4] ? `${latam[4]}:${latam[5]}` : '');
    }

  }

  private daysInMonth(year: number, month: number): number {

    return new Date(year, month, 0).getDate();

  }

}
