import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { CbButtonComponent }
from '../../../shared/components/cb-button/cb-button';

import { CalendarDay }
from '../../models/calendar-day-model';

import { StandbyAssignment }
from '../../models/standby-assignment-model';

@Component({
  selector: 'app-standby-month-view',
  standalone: true,
  imports: [DatePipe, CbButtonComponent],
  templateUrl: './standby-month-view.html',
  styleUrl: './standby-month-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyMonthViewComponent {

  readonly assignments = input<StandbyAssignment[]>([]);

  readonly showPeopleList = input(true);

  readonly outlineMode = input(false);

  readonly hideAppChips = input(false);

  readonly tooltipBelow = input(false);

  readonly peopleListAtBottom = input(false);

  currentDate = new Date();

  calendarDays: CalendarDay[] = [];

  private didFocusAssignments = false;

  readonly weekDays = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
  ];

  constructor() {

    effect(() => {
      this.assignments();
      this.didFocusAssignments = false;
      this.focusOnAssignments();
      this.buildCalendar();
    });

  }

  get monthStandbyGroups(): {

    start: Date;

    end: Date;

    responsables: {

      nombre: string;

      celular: string;

      color: string;

    }[];

    aplicaciones: {

      codigoAplicacion: string;

      nombreAplicacion: string;

    }[];

  }[] {

    const map = new Map<string, {

      start: Date;

      end: Date;

      responsables: {

        nombre: string;

        celular: string;

        color: string;

      }[];

      apps: Map<string, string>;

    }>();

    this.monthAssignments.forEach(assignment => {

      const key =

        `${assignment.fechaInicio.getTime()}-${assignment.fechaFin.getTime()}`;

      let group = map.get(key);

      if (!group) {

        group = {

          start: assignment.fechaInicio,

          end: assignment.fechaFin,

          responsables: [],

          apps: new Map()

        };

        map.set(key, group);

      }

      if (

        !group.responsables.some(

          person => person.nombre === assignment.responsable

        )

      ) {

        group.responsables.push({

          nombre: assignment.responsable,

          celular: assignment.celular,

          color: assignment.color

        });

      }

      assignment.aplicaciones?.forEach(app => {

        group!.apps.set(

          app.codigoAplicacion,

          app.nombreAplicacion

        );

      });

    });

    return [...map.values()]

      .map(group => ({

        start: group.start,

        end: group.end,

        responsables: group.responsables,

        aplicaciones: [...group.apps.entries()].map(

          ([codigoAplicacion, nombreAplicacion]) => ({

            codigoAplicacion,

            nombreAplicacion

          })

        )

      }))

      .sort(

        (a, b) =>

          a.start.getTime() - b.start.getTime()

      );

  }

  get monthAssignments(): StandbyAssignment[] {

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthStart =
      this.startOfDay(new Date(year, month, 1));
    const monthEnd =
      this.startOfDay(new Date(year, month + 1, 0));

    return this.assignments().filter(assignment => {

      const start =
        this.startOfDay(assignment.fechaInicio);
      const end =
        this.startOfDay(assignment.fechaFin);

      return start <= monthEnd && end >= monthStart;

    });

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

  get totalDays(): number {

    return this.calendarDays.filter(
      day => day.currentMonth
    ).length;

  }

  private focusOnAssignments(): void {

    const assignments = this.assignments();

    if (
      this.didFocusAssignments ||
      assignments.length === 0
    ) {
      return;
    }

    const sorted = [...assignments].sort(
      (a, b) =>
        a.fechaInicio.getTime() -
        b.fechaInicio.getTime()
    );

    const first = sorted[0];

    this.currentDate = new Date(
      first.fechaInicio.getFullYear(),
      first.fechaInicio.getMonth(),
      1
    );

    this.didFocusAssignments = true;

  }

  private buildCalendar(): void {

    this.calendarDays = [];

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

    for (
      let i = 0;
      i < firstWeekDay;
      i++
    ) {

      this.calendarDays.push({
        date: new Date(),
        dayNumber: 0,
        currentMonth: false
      });

    }

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {

      const date = new Date(year, month, day);

      const assignments =

        this.getAssignmentsForDate(date);

      const assignment = assignments[0];

      this.calendarDays.push({
        date,
        dayNumber: day,
        currentMonth: true,
        assignment,
        assignments,
        isRangeStart: assignment
          ? this.isSameDate(
              date,
              assignment.fechaInicio
            )
          : false,
        isRangeEnd: assignment
          ? this.isDayBefore(
              date,
              assignment.fechaFin
            )
          : false
      });

    }

  }

  private getAssignmentsForDate(

    date: Date

  ): StandbyAssignment[] {

    const dayTime =

      this.startOfDay(date);

    return this.monthAssignments.filter(

      assignment =>

        dayTime >=

          this.startOfDay(assignment.fechaInicio) &&

        dayTime <

          this.startOfDay(assignment.fechaFin)

    );

  }

  private getAssignmentForDate(
    date: Date
  ): StandbyAssignment | undefined {

    return this.getAssignmentsForDate(date)[0];

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

  private isDayBefore(day: Date, end: Date): boolean {
    const marker = new Date(end);
    marker.setDate(marker.getDate() - 1);
    return this.isSameDate(day, marker);
  }

}
