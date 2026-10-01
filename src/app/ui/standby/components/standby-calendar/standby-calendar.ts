import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output
} from '@angular/core';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  currentMonth: boolean;
}

export interface OccupiedRange {
  start: Date;
  end: Date;
  responsable?: string;
}

@Component({
  selector: 'app-standby-calendar',
  standalone: true,
  templateUrl: './standby-calendar.html',
  styleUrl: './standby-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyCalendarComponent {

  readonly enabled = input(false);

  readonly occupiedRanges = input<OccupiedRange[]>([]);

  readonly showAddPerson = input(false);

  readonly lockSelection = input(false);

  readonly selectionChange = output<Date[]>();

  readonly addPerson = output<void>();

  readonly conflict = output<string>();

  currentDate = new Date();

  /** Fechas de inicio (viernes) de cada semana seleccionada. */
  selectedWeekStarts: Date[] = [];

  readonly weekDays = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
  ];

  days: CalendarDay[] = [];

  constructor() {

    effect(() => {
      this.occupiedRanges();
      this.buildCalendar();
    });

  }

  isFriday(date: Date): boolean {

    return date.getDay() === 5;

  }

  private buildCalendar(): void {

    this.days = [];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays =
      new Date(year, month + 1, 0).getDate();

    let firstWeekDay = firstDay.getDay();
    firstWeekDay =
      firstWeekDay === 0
        ? 6
        : firstWeekDay - 1;

    for (let i = 0; i < firstWeekDay; i++) {
      this.days.push({
        date: new Date(),
        dayNumber: 0,
        currentMonth: false
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);

      this.days.push({
        date,
        dayNumber: day,
        currentMonth: true
      });
    }

  }

  selectDate(day: CalendarDay): void {

    if (!day.currentMonth) {
      return;
    }

    if (this.lockSelection()) {

      if (this.isOccupied(day)) {
        this.emitOccupantsForDay(day.date);
      }

      return;

    }

    if (this.isOccupied(day)) {
      this.emitOccupantsForDay(day.date);
      return;
    }

    if (!this.enabled()) {
      return;
    }

    const selectedStart =
      this.getSelectedWeekStartFor(day.date);

    if (selectedStart) {
      this.selectedWeekStarts =
        this.selectedWeekStarts.filter(
          start =>
            !this.isSameDate(start, selectedStart)
        );

      this.selectionChange.emit(
        [...this.selectedWeekStarts]
      );

      return;
    }

    if (!this.isFriday(day.date)) {
      return;
    }

    if (this.weekHasOccupied(day.date)) {
      this.emitOccupantsForWeek(day.date);
      return;
    }

    const exists =
      this.selectedWeekStarts.find(start =>
        this.isSameDate(start, day.date)
      );

    if (exists) {
      this.selectedWeekStarts =
        this.selectedWeekStarts.filter(
          start =>
            !this.isSameDate(start, day.date)
        );
    } else {
      this.selectedWeekStarts = [
        ...this.selectedWeekStarts,
        day.date
      ];
    }

    this.selectionChange.emit(
      [...this.selectedWeekStarts]
    );

  }

  private emitOccupantsForDay(date: Date): void {

    const occupants = this.occupiedRanges()
      .filter(range =>
        this.isDateInRange(
          date,
          range.start,
          range.end
        )
      )
      .map(range => range.responsable)
      .filter((name): name is string => !!name);

    this.emitOccupantMessage(occupants);

  }

  private emitOccupantsForWeek(date: Date): void {

    const weekStart = this.getWeekStart(date);
    const end = this.addDays(weekStart, 6);

    const occupants = this.occupiedRanges()
      .filter(range =>
        this.rangesOverlap(
          weekStart,
          end,
          range.start,
          range.end
        )
      )
      .map(range => range.responsable)
      .filter((name): name is string => !!name);

    this.emitOccupantMessage(occupants);

  }

  private emitOccupantMessage(
    occupants: string[]
  ): void {

    const unique = [...new Set(occupants)];

    if (unique.length === 0) {
      this.conflict.emit(
        'Ese rango ya está reservado. Elige otro viernes.'
      );

      return;
    }

    const names = unique.join(', ');
    const verb =
      unique.length === 1
        ? 'está'
        : 'están';

    this.conflict.emit(
      `En esos días ${verb}: ${names}. Elige otro viernes.`
    );

  }

  clearSelection(): void {

    this.selectedWeekStarts = [];
    this.selectionChange.emit([]);

  }

  setSelection(dates: Date[]): void {

    this.selectedWeekStarts = [...dates];

    if (dates.length > 0) {
      this.currentDate = new Date(
        dates[0].getFullYear(),
        dates[0].getMonth(),
        1
      );
      this.buildCalendar();
    }

    this.selectionChange.emit([...dates]);

  }

  isInSelectedRange(day: CalendarDay): boolean {

    if (!day.currentMonth) {
      return false;
    }

    return this.selectedWeekStarts.some(start => {
      const end = this.addDays(start, 6);

      return this.isDateInRange(
        day.date,
        start,
        end
      );
    });

  }

  isOccupied(day: CalendarDay): boolean {

    if (!day.currentMonth) {
      return false;
    }

    return this.occupiedRanges().some(range =>
      this.isDateInRange(
        day.date,
        range.start,
        range.end
      )
    );

  }

  isSelectableDay(day: CalendarDay): boolean {

    if (this.lockSelection()) {
      return false;
    }

    return (
      this.enabled() &&
      day.currentMonth &&
      this.isFriday(day.date) &&
      !this.isOccupied(day) &&
      !this.weekHasOccupied(day.date)
    );

  }

  /** Viernes que inicia la semana vie–jue que contiene la fecha. */
  private getWeekStart(date: Date): Date {

    const friday = new Date(date);

    while (friday.getDay() !== 5) {
      friday.setDate(friday.getDate() - 1);
    }

    return friday;

  }

  private getSelectedWeekStartFor(
    date: Date
  ): Date | null {

    const friday = this.getWeekStart(date);
    const end = this.addDays(friday, 6);

    if (!this.isDateInRange(date, friday, end)) {
      return null;
    }

    return this.selectedWeekStarts.find(start =>
      this.isSameDate(start, friday)
    ) ?? null;

  }

  private weekHasOccupied(date: Date): boolean {

    const weekStart = this.getWeekStart(date);
    const end = this.addDays(weekStart, 6);

    return this.occupiedRanges().some(range =>
      this.rangesOverlap(
        weekStart,
        end,
        range.start,
        range.end
      )
    );

  }

  private rangesOverlap(
    aStart: Date,
    aEnd: Date,
    bStart: Date,
    bEnd: Date
  ): boolean {

    const a0 = this.startOfDay(aStart);
    const a1 = this.startOfDay(aEnd);
    const b0 = this.startOfDay(bStart);
    const b1 = this.startOfDay(bEnd);

    return a0 <= b1 && b0 <= a1;

  }

  private isDateInRange(
    date: Date,
    start: Date,
    end: Date
  ): boolean {

    const day = this.startOfDay(date);
    const from = this.startOfDay(start);
    const to = this.startOfDay(end);

    return day >= from && day <= to;

  }

  private addDays(date: Date, days: number): Date {

    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

  private isSameDate(
    a: Date,
    b: Date
  ): boolean {

    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );

  }

  previousMonth(): void {

    this.currentDate =
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      );

    this.buildCalendar();

  }

  nextMonth(): void {

    this.currentDate =
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      );

    this.buildCalendar();

  }

  get monthLabel(): string {

    return this.currentDate.toLocaleDateString(
      'es-CO',
      {
        month: 'long',
        year: 'numeric'
      }
    );

  }

  isLastSelectedDay(day: CalendarDay): boolean {

    const lastEnd = this.getLastSelectedEndDate();

    if (!lastEnd || !day.currentMonth) {
      return false;
    }

    return this.isSameDate(day.date, lastEnd);

  }

  onAddPersonClick(event: Event): void {

    event.stopPropagation();
    this.addPerson.emit();

  }

  private getLastSelectedEndDate(): Date | null {

    if (this.selectedWeekStarts.length === 0) {
      return null;
    }

    const lastStart = [...this.selectedWeekStarts].sort(

      (a, b) => a.getTime() - b.getTime()

    ).at(-1);

    if (!lastStart) {
      return null;
    }

    return this.addDays(lastStart, 6);

  }

}
