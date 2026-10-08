import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal
} from '@angular/core';

export interface CalendarRange {
  from: string;
  to: string;
}

interface CalendarPanel {
  year: number;
  month: number;
}

interface CalendarCell {
  key: string;
  day: number;
  outside: boolean;
  date: Date;
}

@Component({
  selector: 'app-range-calendar',
  standalone: true,
  templateUrl: './range-calendar.html',
  styleUrl: './range-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeCalendarComponent {

  readonly mode = input<'range' | 'month'>('range');

  readonly accepted = output<CalendarRange>();

  readonly cleared = output<void>();

  readonly weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  readonly months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  readonly left = signal<CalendarPanel>(this.currentPanel());

  readonly right = signal<CalendarPanel>(this.shiftPanel(this.currentPanel(), 1));

  readonly start = signal<Date | null>(null);

  readonly end = signal<Date | null>(null);

  cells(panel: CalendarPanel): CalendarCell[] {

    const first = new Date(panel.year, panel.month, 1);
    const lead = first.getDay();
    const days = new Date(panel.year, panel.month + 1, 0).getDate();
    const previousDays = new Date(panel.year, panel.month, 0).getDate();
    const result: CalendarCell[] = [];

    for (let index = lead; index > 0; index -= 1) {
      const date = new Date(panel.year, panel.month - 1, previousDays - index + 1);
      result.push(this.cell(date, true));
    }

    for (let day = 1; day <= days; day += 1) {
      result.push(this.cell(new Date(panel.year, panel.month, day), false));
    }

    let next = 1;

    while (result.length % 7 !== 0) {
      result.push(this.cell(new Date(panel.year, panel.month + 1, next), true));
      next += 1;
    }

    return result;

  }

  shift(
    side: 'left' | 'right',
    unit: 'month' | 'year',
    delta: number
  ): void {

    const source = side === 'left' ? this.left : this.right;
    const current = source();
    const date = new Date(
      current.year + (unit === 'year' ? delta : 0),
      current.month + (unit === 'month' ? delta : 0),
      1
    );

    source.set({
      year: date.getFullYear(),
      month: date.getMonth()
    });

  }

  pick(date: Date): void {

    if (this.mode() === 'month') {
      this.left.set({
        year: date.getFullYear(),
        month: date.getMonth()
      });
      this.start.set(date);
      this.end.set(null);
      return;
    }

    const start = this.start();
    const end = this.end();

    if (!start || end) {
      this.start.set(date);
      this.end.set(null);
      return;
    }

    if (this.dayTime(date) < this.dayTime(start)) {
      this.end.set(start);
      this.start.set(date);
      return;
    }

    this.end.set(date);

  }

  isSelected(date: Date): boolean {

    return this.sameDay(date, this.start()) || this.sameDay(date, this.end());

  }

  isBetween(date: Date): boolean {

    const start = this.start();
    const end = this.end();

    if (!start || !end) {
      return false;
    }

    const time = this.dayTime(date);
    return time > this.dayTime(start) && time < this.dayTime(end);

  }

  accept(): void {

    if (this.mode() === 'month') {
      const panel = this.left();
      const from = new Date(panel.year, panel.month, 1);
      const to = new Date(panel.year, panel.month + 1, 0);
      this.accepted.emit({
        from: this.iso(from),
        to: this.iso(to)
      });
      return;
    }

    const start = this.start();

    if (!start) {
      return;
    }

    const end = this.end() ?? start;
    this.accepted.emit({
      from: this.iso(start),
      to: this.iso(end)
    });

  }

  clear(): void {

    this.start.set(null);
    this.end.set(null);
    this.cleared.emit();

  }

  private cell(date: Date, outside: boolean): CalendarCell {

    return {
      key: this.iso(date),
      day: date.getDate(),
      outside,
      date
    };

  }

  private currentPanel(): CalendarPanel {

    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };

  }

  private shiftPanel(panel: CalendarPanel, delta: number): CalendarPanel {

    const date = new Date(panel.year, panel.month + delta, 1);
    return { year: date.getFullYear(), month: date.getMonth() };

  }

  private sameDay(date: Date, other: Date | null): boolean {

    return !!other && this.dayTime(date) === this.dayTime(other);

  }

  private dayTime(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

  private iso(date: Date): string {

    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;

  }

}
