import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  HostListener,
  input,
  output,
  signal
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import {
  COUNTRY_DIAL_CODES,
  CountryDialCode,
  DEFAULT_COUNTRY_ISO
} from '../../data/country-dial-codes';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor {

  readonly disabled = input(false);

  readonly valueChange = output<string>();

  readonly countries = COUNTRY_DIAL_CODES;

  readonly selectedCountry = signal<CountryDialCode>(
    this.findCountry(DEFAULT_COUNTRY_ISO)!
  );

  readonly localNumber = signal('');

  readonly search = signal('');

  readonly dropdownOpen = signal(false);

  readonly isDisabled = signal(false);

  readonly filteredCountries = signal<CountryDialCode[]>(
    this.countries
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {

    this.parseValue(value ?? '');

  }

  registerOnChange(fn: (value: string) => void): void {

    this.onChange = fn;

  }

  registerOnTouched(fn: () => void): void {

    this.onTouched = fn;

  }

  setDisabledState(isDisabled: boolean): void {

    this.isDisabled.set(isDisabled);

  }

  toggleDropdown(): void {

    if (this.disabled() || this.isDisabled()) {
      return;
    }

    this.dropdownOpen.update(open => !open);

    if (this.dropdownOpen()) {
      this.search.set('');
      this.updateFilteredCountries();
    }

  }

  selectCountry(country: CountryDialCode): void {

    this.selectedCountry.set(country);
    this.dropdownOpen.set(false);
    this.search.set('');
    this.emitValue();

  }

  onLocalNumberChange(value: string): void {

    this.localNumber.set(value.replace(/[^\d\s-]/g, ''));
    this.emitValue();

  }

  onSearchChange(value: string): void {

    this.search.set(value);
    this.updateFilteredCountries();

  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const target = event.target as HTMLElement | null;

    if (!target?.closest('.phone-input')) {
      this.dropdownOpen.set(false);
    }

  }

  private emitValue(): void {

    const digits = this.localNumber().replace(/\D/g, '');

    const full = digits
      ? `+${this.selectedCountry().dial} ${this.localNumber().trim()}`
      : `+${this.selectedCountry().dial}`;

    const value = full.trim();

    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);

  }

  private parseValue(raw: string): void {

    const cleaned = (raw || '').trim();

    if (!cleaned) {
      this.selectedCountry.set(
        this.findCountry(DEFAULT_COUNTRY_ISO)!
      );
      this.localNumber.set('');
      return;
    }

    const normalized = cleaned.replace(/^\+/, '');
    const sorted = [...this.countries].sort(
      (a, b) => b.dial.length - a.dial.length
    );

    const match = sorted.find(country =>
      normalized === country.dial ||
      normalized.startsWith(country.dial + ' ') ||
      normalized.startsWith(country.dial)
    );

    if (match) {
      this.selectedCountry.set(match);
      this.localNumber.set(
        normalized.slice(match.dial.length).trim()
      );
      return;
    }

    this.selectedCountry.set(
      this.findCountry(DEFAULT_COUNTRY_ISO)!
    );
    this.localNumber.set(cleaned.replace(/^\+?57\s?/, ''));

  }

  private updateFilteredCountries(): void {

    const term = this.search().trim().toLowerCase();

    if (!term) {
      this.filteredCountries.set(this.countries);
      return;
    }

    this.filteredCountries.set(
      this.countries.filter(country =>
        country.name.toLowerCase().includes(term) ||
        country.dial.includes(term) ||
        country.iso.toLowerCase().includes(term)
      )
    );

  }

  private findCountry(
    iso: string
  ): CountryDialCode | undefined {

    return this.countries.find(
      country => country.iso === iso
    );

  }

}
