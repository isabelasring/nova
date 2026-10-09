import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

export interface PeriodChoice {
  year: number;
  month: number;
}

@Component({
  selector: 'app-period-picker',
  standalone: true,
  templateUrl: './period-picker.html',
  styleUrl: './period-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodPickerComponent {

  readonly kind = input<'month' | 'year'>('year');

  readonly year = input(new Date().getFullYear());

  readonly month = input(new Date().getMonth());

  readonly chosen = output<PeriodChoice>();

  private readonly pageStart = signal(2015);

  private readonly monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr',
    'May', 'Jun', 'Jul', 'Ago',
    'Sep', 'Oct', 'Nov', 'Dic'
  ];

  readonly title = computed(() => {

    if (this.kind() === 'month') {
      return `${this.pageStart()}`;
    }

    const start = this.pageStart();
    return `${start} - ${start + 11}`;

  });

  readonly items = computed(() => {

    if (this.kind() === 'month') {
      const pageYear = this.pageStart();

      return this.monthNames.map((label, month) => ({
        key: `${pageYear}-${month}`,
        label,
        year: pageYear,
        month,
        current: pageYear === this.year() && month === this.month()
      }));
    }

    const start = this.pageStart();

    return Array.from({ length: 12 }, (_, index) => {
      const year = start + index;

      return {
        key: `${year}`,
        label: `${year}`,
        year,
        month: this.month(),
        current: year === this.year()
      };
    });

  });

  constructor() {

    effect(() => {
      const year = this.year();
      const kind = this.kind();

      if (kind === 'month') {
        this.pageStart.set(year);
        return;
      }

      const offset = ((year - 2015) % 12 + 12) % 12;
      this.pageStart.set(year - offset);
    });

  }

  step(direction: -1 | 1): void {

    if (this.kind() === 'month') {
      this.pageStart.update(year => year + direction);
      return;
    }

    this.pageStart.update(year => year + direction * 12);

  }

  choose(item: { year: number; month: number }): void {

    this.chosen.emit({
      year: item.year,
      month: item.month
    });

  }

}
