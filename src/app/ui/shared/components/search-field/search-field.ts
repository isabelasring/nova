import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-search-field',
  standalone: true,
  templateUrl: './search-field.html',
  styleUrl: './search-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchFieldComponent),
      multi: true
    }
  ]
})
export class SearchFieldComponent implements ControlValueAccessor {

  readonly placeholder = input('Buscar');

  readonly value = input<string | undefined>(undefined);

  readonly valueChange = output<string>();

  readonly text = signal('');

  readonly disabled = signal(false);

  private readonly box = viewChild<ElementRef<HTMLInputElement>>('box');

  private onChange: (value: string) => void = () => {};

  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {

    this.text.set(value ?? '');

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

  shown(): string {

    return this.value() ?? this.text();

  }

  focus(): void {

    this.box()?.nativeElement.focus({ preventScroll: true });

  }

  onInput(raw: string): void {

    this.text.set(raw);
    this.onChange(raw);
    this.valueChange.emit(raw);

  }

  blur(): void {

    this.onTouched();

  }

}
