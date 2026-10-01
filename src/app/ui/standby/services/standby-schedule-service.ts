import { Injectable } from '@angular/core';

import {
  StandbyAssignment,
  StandbyAssociatedApp
} from '../models/standby-assignment.model';

import { STANDBY_USER_PHONES }
from '../mocks/standby-user-phones.mock';

import { STANDBY_ASSIGNMENTS_MOCK }
from '../mocks/standby-assignments.mock';

import { toStandbyWeek }
from '../utils/standby-week.util';

@Injectable({
  providedIn: 'root'
})
export class StandbyScheduleService {

  private readonly colors = [
    '#9063cd',
    '#f586cd',
    '#00c389'
  ];

  private userColors =
    new Map<string, string>();

  private nextId = 1100;

  draftAssignments: StandbyAssignment[] = [];

  savedAssignments: StandbyAssignment[] = [
    ...STANDBY_ASSIGNMENTS_MOCK
  ];

  /** Snapshot para restaurar si se cierra el modal de edición sin guardar. */
  private editRestore: StandbyAssignment[] = [];

  get isEditing(): boolean {
    return this.editRestore.length > 0;
  }

  constructor() {

    STANDBY_ASSIGNMENTS_MOCK.forEach(assignment => {

      if (!this.userColors.has(assignment.responsable)) {
        this.userColors.set(
          assignment.responsable,
          assignment.color
        );
      }

    });

  }

  /**
   * Saca la asignación de guardados y la pone en borrador
   * para reabrir el modal de programación con lo ya configurado.
   */
  beginEdit(assignmentId: number): StandbyAssignment | null {

    const assignment = this.savedAssignments.find(
      item => item.id === assignmentId
    );

    if (!assignment) {
      return null;
    }

    // Descarta borradores previos de otra sesión
    this.draftAssignments = [];
    this.editRestore = [];

    const clone: StandbyAssignment = {
      ...assignment,
      fechaInicio: new Date(assignment.fechaInicio),
      fechaFin: new Date(assignment.fechaFin),
      aplicaciones: [...(assignment.aplicaciones ?? [])]
    };

    this.editRestore = [clone];
    this.savedAssignments = this.savedAssignments.filter(
      item => item.id !== assignmentId
    );
    this.draftAssignments = [
      {
        ...clone,
        fechaInicio: new Date(clone.fechaInicio),
        fechaFin: new Date(clone.fechaFin),
        aplicaciones: [...(clone.aplicaciones ?? [])]
      }
    ];

    return clone;

  }

  /** Restaura la asignación si se cancela la edición. */
  cancelPendingEdit(): void {

    if (this.editRestore.length === 0) {
      this.draftAssignments = [];
      return;
    }

    this.savedAssignments = [
      ...this.savedAssignments,
      ...this.editRestore.map(item => ({
        ...item,
        fechaInicio: new Date(item.fechaInicio),
        fechaFin: new Date(item.fechaFin),
        aplicaciones: [...(item.aplicaciones ?? [])]
      }))
    ];

    this.editRestore = [];
    this.draftAssignments = [];

  }

  clearPendingEdit(): void {
    this.editRestore = [];
  }

  acceptWeeks(
    responsable: string,
    weeks: { start: Date; end: Date }[],
    aplicaciones: StandbyAssociatedApp[] = []
  ): void {

    const celular =
      STANDBY_USER_PHONES[responsable] ??
      '+57 300 000 0000';

    weeks.forEach(week => {

      const { start, end } = toStandbyWeek(week.start);

      const weekColor = this.resolveWeekColor(
        responsable,
        { start, end },
        aplicaciones
      );

      this.draftAssignments = [
        ...this.draftAssignments,
        {
          id: this.nextId++,
          responsable,
          celular,
          fechaInicio: start,
          fechaFin: end,
          color: weekColor,
          aplicaciones: [...aplicaciones]
        }
      ];

    });

  }

  save(): void {

    this.savedAssignments = [
      ...this.savedAssignments,
      ...this.draftAssignments
    ];

    this.draftAssignments = [];
    this.editRestore = [];

  }

  /** Quita del borrador a una persona en una semana / apps concretas. */
  removeDraftPerson(
    responsable: string,
    start: Date,
    appCodes: string[]
  ): void {

    const startKey = this.startOfDay(start);
    const codeSet = new Set(appCodes);

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      if (assignment.responsable !== responsable) {
        return true;
      }

      if (this.startOfDay(assignment.fechaInicio) !== startKey) {
        return true;
      }

      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      const sameApps =
        codes.length === codeSet.size &&
        codes.every(code => codeSet.has(code));

      return !sameApps;
    });

  }

  /** Quita del borrador toda una selección aceptada (semana + apps). */
  removeDraftGroup(start: Date, appCodes: string[]): void {

    const startKey = this.startOfDay(start);
    const codeSet = new Set(appCodes);

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      if (this.startOfDay(assignment.fechaInicio) !== startKey) {
        return true;
      }

      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      const sameApps =
        codes.length === codeSet.size &&
        codes.every(code => codeSet.has(code));

      return !sameApps;
    });

  }

  /** Quita del borrador todo lo ligado a unas apps. */
  removeDraftsForApps(appCodes: string[]): void {

    const codeSet = new Set(appCodes);

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      return !codes.some(code => codeSet.has(code));
    });

  }

  /** Quita a una persona de todos los borradores ligados a esas apps. */
  removeDraftPersonFromApps(
    responsable: string,
    appCodes: string[]
  ): void {

    const codeSet = new Set(appCodes);

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      if (assignment.responsable !== responsable) {
        return true;
      }

      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      return !codes.some(code => codeSet.has(code));
    });

  }

  get hasDraft(): boolean {

    return this.draftAssignments.length > 0;

  }

  get hasSaved(): boolean {

    return this.savedAssignments.length > 0;

  }

  getByResponsable(
    responsable: string
  ): StandbyAssignment[] {

    return this.savedAssignments.filter(
      assignment =>
        assignment.responsable === responsable
    );

  }

  getAllResponsables(): string[] {

    const names = new Set<string>();

    Object.keys(STANDBY_USER_PHONES).forEach(name => {
      names.add(name);
    });

    this.savedAssignments.forEach(assignment => {
      names.add(assignment.responsable);
    });

    return [...names].sort((a, b) =>
      a.localeCompare(b, 'es')
    );

  }

  searchResponsables(term: string): string[] {

    const query = term.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.getAllResponsables().filter(name =>
      name.toLowerCase().includes(query)
    );

  }

  getAssignmentsForPerson(
    responsable: string
  ): StandbyAssignment[] {

    return this.getByResponsable(responsable).sort(
      (a, b) =>
        a.fechaInicio.getTime() - b.fechaInicio.getTime()
    );

  }

  getByAppCodigo(
    codigoAplicacion: string
  ): StandbyAssignment[] {

    return this.savedAssignments.filter(
      assignment =>
        assignment.aplicaciones?.some(
          app =>
            app.codigoAplicacion === codigoAplicacion
        )
    );

  }

  isAppProgrammed(
    codigoAplicacion: string
  ): boolean {

    return this.getByAppCodigo(codigoAplicacion).length > 0;

  }

  hasAppStandbyInCurrentMonth(
    codigoAplicacion: string,
    referenceDate: Date = new Date()
  ): boolean {

    return this.getByAppCodigo(codigoAplicacion).some(
      assignment =>
        this.overlapsMonth(assignment, referenceDate)
    );

  }

  private overlapsMonth(
    assignment: StandbyAssignment,
    referenceDate: Date
  ): boolean {

    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    const monthStart =
      this.startOfDay(new Date(year, month, 1));
    const monthEnd =
      this.startOfDay(new Date(year, month + 1, 0));

    const start =
      this.startOfDay(assignment.fechaInicio);
    const end =
      this.startOfDay(assignment.fechaFin);

    return start <= monthEnd && end >= monthStart;

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

  private resolveWeekColor(
    responsable: string,
    week: { start: Date; end: Date },
    aplicaciones: StandbyAssociatedApp[]
  ): string {

    const existing = [
      ...this.draftAssignments,
      ...this.savedAssignments
    ].find(assignment =>
      this.sameWeek(assignment, week) &&
      this.sharesApp(assignment, aplicaciones)
    );

    if (existing) {
      return existing.color;
    }

    return this.getColor(responsable);

  }

  private sameWeek(
    assignment: StandbyAssignment,
    week: { start: Date; end: Date }
  ): boolean {

    return (
      this.startOfDay(assignment.fechaInicio) ===
        this.startOfDay(week.start) &&
      this.startOfDay(assignment.fechaFin) ===
        this.startOfDay(week.end)
    );

  }

  private sharesApp(
    assignment: StandbyAssignment,
    aplicaciones: StandbyAssociatedApp[]
  ): boolean {

    if (!aplicaciones.length) {
      return true;
    }

    return aplicaciones.some(app =>
      assignment.aplicaciones?.some(
        item =>
          item.codigoAplicacion === app.codigoAplicacion
      )
    );

  }

  private getColor(
    responsable: string
  ): string {

    const existing =
      this.userColors.get(responsable);

    if (existing) {
      return existing;
    }

    const color =
      this.colors[
        this.userColors.size %
        this.colors.length
      ];

    this.userColors.set(
      responsable,
      color
    );

    return color;

  }

}