import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  HostListener,
  input,
  output,
  signal
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

export interface OptionItem {
  value: string;
  label: string;
}

@Component({
  selector: 'app-option-select',
  standalone: true,
  templateUrl: './option-select.html',
  styleUrl: './option-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionSelectComponent),
      multi: true
    }
  ]
})
export class OptionSelectComponent implements ControlValueAccessor {

  readonly label = input('');

  readonly placeholder = input('Seleccione una opción');

  readonly hint = input('');

  readonly disabled = input(false);

  readonly options = input<Array<string | OptionItem>>([]);

  readonly value = input<string | undefined>(undefined);

  readonly valueChange = output<string>();

  readonly open = signal(false);

  private readonly formDisabled = signal(false);

  private readonly current = signal('');

  readonly choices = computed<OptionItem[]>(() =>
    this.options().map(option =>
      typeof option === 'string'
        ? { value: option, label: option }
        : option
    )
  );

  readonly selectedLabel = computed(() => {

    const value = this.shown();
    const match = this.choices().find(option => option.value === value);

    return match?.label || (value ? value : '');

  });

  private onChange: (value: string) => void = () => {};

  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {

    this.current.set(value ?? '');

  }

  registerOnChange(fn: (value: string) => void): void {

    this.onChange = fn;

  }

  registerOnTouched(fn: () => void): void {

    this.onTouched = fn;

  }

  setDisabledState(isDisabled: boolean): void {

    this.formDisabled.set(isDisabled);

    if (isDisabled) {
      this.open.set(false);
    }

  }

  locked(): boolean {

    return this.disabled() || this.formDisabled();

  }

  shown(): string {

    return this.value() ?? this.current();

  }

  toggle(event: Event): void {

    event.stopPropagation();

    if (this.locked()) {
      return;
    }

    this.open.update(value => !value);

  }

  pick(option: OptionItem, event: Event): void {

    event.stopPropagation();
    this.current.set(option.value);
    this.onChange(option.value);
    this.valueChange.emit(option.value);
    this.onTouched();
    this.open.set(false);

  }

  @HostListener('document:click')
  close(): void {

    this.open.set(false);

  }

}
