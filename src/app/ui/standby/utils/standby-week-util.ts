/**
 * Periodo de standby: viernes 12:00 → viernes siguiente 12:00.
 */

export function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

export function isFriday(date: Date): boolean {
  return date.getDay() === 5;
}

export function atNoon(date: Date): Date {
  const result = startOfDay(date);
  result.setHours(12, 0, 0, 0);
  return result;
}

/** Viernes que inicia el turno que contiene la fecha. */
export function fridayOfStandbyWeek(date: Date): Date {
  const friday = startOfDay(date);

  while (friday.getDay() !== 5) {
    friday.setDate(friday.getDate() - 1);
  }

  return friday;
}

/** Viernes siguiente a las 12:00, cierre del turno. */
export function nextFridayOfStandby(fridayStart: Date): Date {
  const end = atNoon(fridayStart);
  end.setDate(end.getDate() + 7);
  return end;
}

export function toStandbyWeek(date: Date): {
  start: Date;
  end: Date;
} {
  const start = atNoon(fridayOfStandbyWeek(date));
  return {
    start,
    end: nextFridayOfStandby(start)
  };
}

export function isValidStandbyWeek(
  start: Date,
  end: Date
): boolean {
  const normalized = toStandbyWeek(start);

  return (
    isFriday(start) &&
    isFriday(end) &&
    atNoon(start).getTime() === normalized.start.getTime() &&
    atNoon(end).getTime() === normalized.end.getTime()
  );
}

/**
 * Turno viernes–viernes del mes cuyo viernes de inicio es el más cercano
 * a `preferredDay` (día del mes, 1–31).
 */
export function standbyWeekNearDay(
  preferredDay: number,
  monthOffset = 0,
  reference: Date = new Date()
): { fechaInicio: Date; fechaFin: Date } {
  const year = reference.getFullYear();
  const month = reference.getMonth() + monthOffset;
  const preferred = startOfDay(
    new Date(year, month, preferredDay)
  );
  const { start, end } = toStandbyWeek(preferred);

  return {
    fechaInicio: start,
    fechaFin: end
  };
}
