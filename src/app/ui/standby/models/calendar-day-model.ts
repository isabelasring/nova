import { StandbyAssignment }
from './standby-assignment-model';

export interface CalendarDay {

  date: Date;

  dayNumber: number;

  currentMonth: boolean;

  assignment?: StandbyAssignment;

  assignments?: StandbyAssignment[];

  isRangeStart?: boolean;

  isRangeEnd?: boolean;

}