import {

  ChangeDetectionStrategy,

  Component,

  effect,

  inject,

  input,

  output,

  ElementRef,

  ViewChild

} from '@angular/core';

import { DatePipe } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { CbButtonComponent }
from '../../../shared/components/cb-button/cb-button';



import {

  OccupiedRange,

  StandbyCalendarComponent

} from '../standby-calendar/standby-calendar';



import { StandbyScheduleService }

from '../../services/standby-schedule-service';



import { StandbyAlertComponent }

from '../standby-alert/standby-alert';



import { StandbyApplication }

from '../../models/standby-application-model';



import {

  StandbyAssociatedApp

} from '../../models/standby-assignment-model';

import { STANDBY_APPLICATIONS }
from '../../mocks/standby-applications-mock';

import { toStandbyWeek }
from '../../utils/standby-week-util';



interface GroupedAcceptance {

  codigoAplicacion: string;

  nombreAplicacion: string;

  aplicaciones: StandbyAssociatedApp[];

  appsKey: string;

  start: Date;

  end: Date;

  responsables: string[];

  observacion?: string;

  quierePrioridad?: boolean;

}

interface ProductSelectionState {

  selectedUser?: string;

  coResponsables: string[];

  selectedWeekStarts: Date[];

}



@Component({

  selector: 'app-standby-modal',

  standalone: true,

  imports: [

    StandbyCalendarComponent,

    DatePipe,

    StandbyAlertComponent,

    FormsModule,

    CbButtonComponent

  ],

  templateUrl: './standby-modal.html',

  styleUrls: ['./standby-modal.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush

})

export class StandbyModalComponent {



  readonly visible = input(false);



  readonly aplicaciones = input<StandbyApplication[]>([]);

  /** Catálogo para + App / + Servicio. Por defecto apps TI. */
  readonly catalog = input<StandbyApplication[]>(STANDBY_APPLICATIONS);

  /** Otras áreas: sin apps, solo servicios. */
  readonly serviceMode = input(false);

  /** Edición de una programación existente. */
  readonly editMode = input(false);

  readonly closed = output<void>();



  readonly saved = output<{
    appCodigo: string;
    appNombre: string;
  }>();



  @ViewChild(StandbyCalendarComponent)

  calendar?: StandbyCalendarComponent;



  @ViewChild('usersSection')

  usersSection?: ElementRef<HTMLElement>;



  @ViewChild('userSearchInput')

  userSearchInput?: ElementRef<HTMLInputElement>;



  private readonly scheduleService =

    inject(StandbyScheduleService);



  activeAppIndex = 0;

  /** Una app a la vez, o todas con la misma persona/fechas. */
  programMode: 'single' | 'all' = 'all';

  /** Apps de esta sesión (incluye las añadidas dentro del modal). */
  sessionApps: StandbyApplication[] = [];

  showAddAppMenu = false;

  addAppSearch = '';

  private readonly productStates =
    new Map<string, ProductSelectionState>();



  selectedUser?: string;



  /** Personas adicionales para el mismo periodo de standby. */
  coResponsables: string[] = [];

  /** Nota del resumen. Viaja con la selección aceptada. */
  observacion = '';

  /**
   * null = todavía no se pregunta.
   * La pregunta sale solo al agregar otra persona al mismo standby.
   */
  quierePrioridad: boolean | null = null;

  askingPriority = false;



  addingCoResponsable = false;



  addingToExistingWeek: GroupedAcceptance | null = null;



  selectedWeekStarts: Date[] = [];



  userSearch = '';



  showAcceptAlert = false;



  showAcceptConfirmAlert = false;



  showSaveAlert = false;



  showConflictAlert = false;



  conflictMessage = '';



  users = [

    'Daniel Lopez Montes',

    'Bibiana Montoya',

    'Dylan Martinez',

    'Jahiver Horacio Lopez',

    'Miguel Ángel García'

  ];



  constructor() {

    effect(() => {

      if (this.visible()) {

        this.resetModalState();

      }

    });

  }



  get hasMultipleProducts(): boolean {

    return this.sessionApps.length > 1;

  }

  get isProgramAll(): boolean {

    return this.hasMultipleProducts && this.programMode === 'all';

  }

  get appsForProgramming(): StandbyApplication[] {

    if (this.isProgramAll) {
      return this.sessionApps;
    }

    const active = this.activeApp;
    return active ? [active] : [];

  }

  get appsForProgrammingLabel(): string {

    const apps = this.appsForProgramming;

    if (apps.length === 0) {
      return '';
    }

    const labelOf = (app: StandbyApplication) =>
      this.serviceMode()
        ? (app.service || app.nombreAplicacion)
        : app.codigoAplicacion;

    if (apps.length === 1) {
      return labelOf(apps[0]);
    }

    if (apps.length <= 3) {
      return apps.map(labelOf).join(', ');
    }

    return this.serviceMode()
      ? `${apps.length} servicios`
      : `${apps.length} aplicaciones`;

  }

  get activeApp(): StandbyApplication | undefined {

    return this.sessionApps[this.activeAppIndex];

  }



  get activeAppCodigo(): string {

    return this.activeApp?.codigoAplicacion ?? '';

  }



  isAppConfigured(codigo: string): boolean {

    return this.scheduleService.draftAssignments.some(

      assignment =>

        assignment.aplicaciones?.some(

          app => app.codigoAplicacion === codigo

        )

    );

  }

  get addableApplications(): StandbyApplication[] {

    const inSession = new Set(
      this.sessionApps.map(app => app.codigoAplicacion)
    );

    return this.catalog().filter(
      app =>
        !inSession.has(app.codigoAplicacion) &&
        !this.scheduleService.isAppProgrammed(app.codigoAplicacion)
    );

  }

  get filteredAddableApps(): StandbyApplication[] {

    const term = this.addAppSearch.trim().toLowerCase();
    const list = this.addableApplications;

    if (!term) {
      return list;
    }

    return list.filter(
      app =>
        app.codigoAplicacion.toLowerCase().includes(term) ||
        app.nombreAplicacion.toLowerCase().includes(term) ||
        (app.service ?? '').toLowerCase().includes(term) ||
        app.celula.toLowerCase().includes(term)
    );

  }

  toggleAddAppMenu(): void {

    this.showAddAppMenu = !this.showAddAppMenu;
    this.addAppSearch = '';

  }

  closeAddAppMenu(): void {

    this.showAddAppMenu = false;
    this.addAppSearch = '';

  }

  addApplication(app: StandbyApplication): void {

    if (
      this.sessionApps.some(
        item => item.codigoAplicacion === app.codigoAplicacion
      )
    ) {
      return;
    }

    this.sessionApps = [...this.sessionApps, { ...app, selected: true }];

    if (this.sessionApps.length > 1) {
      this.programMode = 'all';
    }

    this.activeAppIndex = this.sessionApps.length - 1;
    this.closeAddAppMenu();

  }

  removeApplication(codigoAplicacion: string, event?: Event): void {

    event?.preventDefault();
    event?.stopPropagation();

    if (this.sessionApps.length <= 1) {
      // Permite quitar la única app: queda vacío hasta que agreguen otra
      this.scheduleService.removeDraftsForApps([codigoAplicacion]);
      this.productStates.delete(codigoAplicacion);
      this.sessionApps = [];
      this.activeAppIndex = 0;
      this.programMode = 'single';
      this.clearSelectedUser();
      return;
    }

    const removedIndex = this.sessionApps.findIndex(
      app => app.codigoAplicacion === codigoAplicacion
    );

    if (removedIndex < 0) {
      return;
    }

    this.scheduleService.removeDraftsForApps([codigoAplicacion]);
    this.productStates.delete(codigoAplicacion);
    this.sessionApps = this.sessionApps.filter(
      app => app.codigoAplicacion !== codigoAplicacion
    );

    if (this.activeAppIndex >= this.sessionApps.length) {
      this.activeAppIndex = Math.max(0, this.sessionApps.length - 1);
    } else if (removedIndex < this.activeAppIndex) {
      this.activeAppIndex -= 1;
    }

    if (this.sessionApps.length <= 1) {
      this.programMode = 'single';
    }

    this.restoreProductState(this.activeAppCodigo);

  }

  clearSelectedUser(): void {

    const name = this.selectedUser;

    this.selectedUser = undefined;
    this.coResponsables = [];
    this.quierePrioridad = null;
    this.askingPriority = false;
    this.addingCoResponsable = false;
    this.addingToExistingWeek = null;
    this.selectedWeekStarts = [];
    this.calendar?.clearSelection();

    if (name && this.sessionApps.length > 0) {
      this.scheduleService.removeDraftPersonFromApps(
        name,
        this.sessionApps.map(app => app.codigoAplicacion)
      );
    }

    this.persistActiveProductState();

  }

  removeCoResponsable(name: string): void {

    this.coResponsables = this.coResponsables.filter(
      item => item !== name
    );
    this.persistActiveProductState();

  }

  removeAcceptedPerson(
    group: GroupedAcceptance,
    name: string,
    event?: Event
  ): void {

    event?.preventDefault();
    event?.stopPropagation();

    const codes = group.aplicaciones.map(app => app.codigoAplicacion);
    this.scheduleService.removeDraftPerson(name, group.start, codes);

    if (this.selectedUser === name) {
      this.clearSelectedUser();
    }

    this.removeCoResponsable(name);

  }

  removeAcceptedGroup(
    group: GroupedAcceptance,
    event?: Event
  ): void {

    event?.preventDefault();
    event?.stopPropagation();

    const codes = group.aplicaciones.map(app => app.codigoAplicacion);
    this.scheduleService.removeDraftGroup(group.start, codes);

    if (group.responsables.includes(this.selectedUser ?? '')) {
      this.clearSelectedUser();
    }

  }

  setProgramMode(mode: 'single' | 'all'): void {

    if (mode === this.programMode || !this.hasMultipleProducts) {
      return;
    }

    this.persistActiveProductState();
    this.programMode = mode;
    this.addingCoResponsable = false;
    this.addingToExistingWeek = null;

    if (mode === 'single') {
      this.restoreProductState(this.activeAppCodigo);
    }

  }



  get filteredUsers(): string[] {



    const term = this.userSearch.trim().toLowerCase();



    if (!term) {

      return this.users;

    }



    return this.users.filter(user =>

      user.toLowerCase().includes(term)

    );



  }



  get occupiedRanges(): OccupiedRange[] {

    const codes = new Set(
      this.appsForProgramming.map(app => app.codigoAplicacion)
    );

    if (codes.size === 0) {

      return [];

    }



    return [

      ...this.scheduleService.draftAssignments,

      ...this.scheduleService.savedAssignments

    ]

      .filter(assignment =>

        assignment.aplicaciones?.some(

          app => codes.has(app.codigoAplicacion)

        )

      )

      .map(assignment => ({

        start: assignment.fechaInicio,

        end: assignment.fechaFin,

        responsable: assignment.responsable

      }));



  }



  get groupedAccepted(): GroupedAcceptance[] {

    const map =
      new Map<string, GroupedAcceptance>();

    this.scheduleService.draftAssignments.forEach(
      assignment => {

        const apps = [...(assignment.aplicaciones ?? [])];

        if (!apps.length) {
          return;
        }

        const appsKey = apps
          .map(app => app.codigoAplicacion)
          .sort()
          .join('|');

        const key =
          `${assignment.fechaInicio.getTime()}-${appsKey}`;

        let group = map.get(key);

        if (!group) {
          const primary = apps[0];

          group = {
            codigoAplicacion: primary.codigoAplicacion,
            nombreAplicacion: primary.nombreAplicacion,
            aplicaciones: apps,
            appsKey,
            start: assignment.fechaInicio,
            end: assignment.fechaFin,
            responsables: [],
            observacion: assignment.observacion,
            quierePrioridad: assignment.quierePrioridad
          };

          map.set(key, group);
        }

        if (
          !group.responsables.includes(
            assignment.responsable
          )
        ) {
          const slot = Math.max(
            0,
            (assignment.prioridad ?? group.responsables.length + 1) - 1
          );
          group.responsables.splice(
            slot,
            0,
            assignment.responsable
          );
        }

        if (assignment.observacion) {
          group.observacion = assignment.observacion;
        }

        if (assignment.quierePrioridad !== undefined) {
          group.quierePrioridad = assignment.quierePrioridad;
        }

      }
    );

    return [...map.values()].sort(
      (a, b) => {
        const byApps = a.appsKey.localeCompare(b.appsKey);

        if (byApps !== 0) {
          return byApps;
        }

        return a.start.getTime() - b.start.getTime();
      }
    );

  }



  get groupedAcceptedForActiveApp(): GroupedAcceptance[] {

    if (this.isProgramAll) {
      return this.groupedAccepted;
    }

    const codigo = this.activeAppCodigo;

    return this.groupedAccepted.filter(
      group =>
        group.aplicaciones.some(
          app => app.codigoAplicacion === codigo
        )
    );

  }



  get responsablesForSummary(): string[] {



    const list: string[] = [];



    if (this.selectedUser) {

      list.push(this.selectedUser);

    }



    for (const name of this.coResponsables) {

      if (!list.includes(name)) {

        list.push(name);

      }

    }



    return list;



  }



  get responsablesForSummaryDisplay(): string[] {



    const combined = [

      ...(this.addingToExistingWeek?.responsables ?? [])

    ];



    for (const name of this.responsablesForSummary) {

      if (!combined.includes(name)) {

        combined.push(name);

      }

    }



    return combined;



  }



  get acceptAlertMessage(): string {

    if (!this.hasMultipleProducts) {

      return 'Continúa con otros usuarios para programar standby.';

    }

    if (this.isProgramAll) {

      return 'La selección quedó aplicada a todas las aplicaciones. Revisa y guarda, o sigue agregando personas.';

    }

    const pending = this.sessionApps.filter(

      app => !this.isAppConfigured(app.codigoAplicacion)

    );

    if (pending.length === 0) {

      return 'Todos los productos tienen selección. Revisa y guarda.';

    }

    return `Listo para ${this.activeApp?.codigoAplicacion ?? 'este producto'}. Cambia de producto arriba para programar ${pending.length} restante(s).`;

  }



  get canAddCoResponsable(): boolean {



    return (

      !!this.selectedUser &&

      this.standbyWeeks.length > 0

    );



  }



  get showAddPersonOnCalendar(): boolean {



    return (

      this.canAddCoResponsable &&

      !this.addingCoResponsable

    );



  }



  get lockCalendarSelection(): boolean {



    if (this.addingCoResponsable) {

      return true;

    }



    return (

      this.standbyWeeks.length > 0 &&

      !!this.selectedUser

    );



  }



  get hasPendingStandbyDraft(): boolean {



    return (

      this.standbyWeeks.length > 0 &&

      this.responsablesForSummary.length > 0

    );



  }



  selectActiveApp(index: number): void {

    if (this.isProgramAll) {
      this.setProgramMode('single');
    }

    if (

      index === this.activeAppIndex ||

      index < 0 ||

      index >= this.sessionApps.length

    ) {

      return;

    }



    this.persistActiveProductState();

    this.activeAppIndex = index;

    this.addingCoResponsable = false;

    this.addingToExistingWeek = null;

    this.restoreProductState(this.activeAppCodigo);



  }



  selectUser(user: string): void {



    if (

      this.addingCoResponsable &&

      this.selectedWeekStarts.length > 0

    ) {



      if (

        this.responsablesForSummary.includes(user) ||

        this.addingToExistingWeek?.responsables.includes(user)

      ) {

        this.addingCoResponsable = false;

        return;

      }



      if (this.isOnAnotherStandby(user)) {

        this.rejectOtherStandby(user);

        return;

      }



      this.coResponsables = [

        ...this.coResponsables,

        user

      ];

      this.addingCoResponsable = false;

      this.persistActiveProductState();

      return;

    }



    if (this.selectedUser === user) {

      this.clearSelectedUser();
      return;

    }



    if (this.isOnAnotherStandby(user)) {

      this.rejectOtherStandby(user);

      return;

    }



    this.selectedUser = user;

    this.quierePrioridad = null;

    this.coResponsables = [];

    this.addingCoResponsable = false;

    this.addingToExistingWeek = null;

    this.calendar?.clearSelection();

    this.selectedWeekStarts = [];



    this.persistActiveProductState();



  }



  startAddCoResponsable(): void {



    if (!this.canAddCoResponsable) {

      return;

    }



    if (this.quierePrioridad === null) {

      this.askingPriority = true;

      this.addingCoResponsable = false;

      return;

    }



    this.askingPriority = false;

    this.addingCoResponsable = true;

    this.addingToExistingWeek = null;

    this.calendar?.setSelection(

      this.selectedWeekStarts

    );

    this.persistActiveProductState();

    this.focusUsersForCoResponsable();



  }



  startAddToAcceptedWeek(

    group: GroupedAcceptance

  ): void {

    if (group.aplicaciones.length > 1) {
      this.programMode = 'all';
    } else {
      const index = this.sessionApps.findIndex(
        app =>
          app.codigoAplicacion ===
          group.codigoAplicacion
      );

      if (index >= 0) {
        this.selectActiveApp(index);
      }
    }

    this.selectedUser = undefined;

    this.coResponsables = [];

    this.addingToExistingWeek = group;

    this.quierePrioridad = group.quierePrioridad ?? null;

    this.askingPriority = group.quierePrioridad === undefined;

    this.addingCoResponsable = group.quierePrioridad !== undefined;

    this.selectedWeekStarts = [

      new Date(group.start)

    ];

    this.persistActiveProductState();

    this.calendar?.setSelection(

      this.selectedWeekStarts

    );

    if (!this.askingPriority) {

      this.focusUsersForCoResponsable();

    }



  }



  onSelectionChange(dates: Date[]): void {



    if (dates.length > 1) {

      const keep = this.selectedWeekStarts[0] ?? dates[0];

      this.selectedWeekStarts = [keep];

      this.calendar?.setSelection(this.selectedWeekStarts);

      this.conflictMessage =
        'Esta persona ya tiene un standby. No se puede programar en otro.';

      this.showConflictAlert = true;

      this.persistActiveProductState();

      return;

    }



    this.selectedWeekStarts = dates.sort(

      (a, b) =>

        a.getTime() - b.getTime()

    );



    if (this.selectedWeekStarts.length === 0) {

      this.coResponsables = [];

      this.addingCoResponsable = false;

      this.addingToExistingWeek = null;

    }



    this.persistActiveProductState();



  }



  onConflict(message: string): void {



    this.conflictMessage = message;

    this.showConflictAlert = true;

    this.showAcceptAlert = false;

    this.showAcceptConfirmAlert = false;

    this.showSaveAlert = false;



  }



  closeConflictAlert(): void {



    this.showConflictAlert = false;



  }



  get standbyWeeks(): {

    start: Date;

    end: Date;

  }[] {

    return this.selectedWeekStarts.map(start =>
      toStandbyWeek(start)
    );

  }



  get usesPriority(): boolean {

    if (this.quierePrioridad !== null) {
      return this.quierePrioridad;
    }

    return this.addingToExistingWeek?.quierePrioridad === true;

  }



  confirmPriority(value: boolean): void {

    this.quierePrioridad = value;
    this.askingPriority = false;
    this.addingCoResponsable = true;
    this.focusUsersForCoResponsable();

  }



  isPersonBlocked(name: string): boolean {

    if (
      this.addingCoResponsable &&
      (this.responsablesForSummary.includes(name) ||
        this.addingToExistingWeek?.responsables.includes(name))
    ) {
      return true;
    }

    return this.isOnAnotherStandby(name);

  }



  private rejectOtherStandby(name: string): void {

    this.conflictMessage =
      `${name} ya está en un standby. No se puede programar en otro.`;

    this.showConflictAlert = true;

    this.addingCoResponsable = false;

  }



  private isOnAnotherStandby(name: string): boolean {

    const allowed = new Set(
      (this.addingCoResponsable ? this.selectedWeekStarts : [])
        .map(date => this.dayKey(date))
    );

    return [
      ...this.scheduleService.draftAssignments,
      ...this.scheduleService.savedAssignments
    ].some(assignment =>
      assignment.responsable === name &&
      !allowed.has(this.dayKey(assignment.fechaInicio))
    );

  }



  private dayKey(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }



  draftIndex(name: string): number {

    return this.responsablesForSummary.indexOf(name);

  }



  priorityHint(index: number): string {

    if (index === 0) {
      return 'Llamar primero';
    }

    return 'Si no contesta la anterior';

  }



  movePriority(index: number, direction: -1 | 1): void {

    const list = [...this.responsablesForSummary];
    const next = index + direction;

    if (next < 0 || next >= list.length) {
      return;
    }

    const current = list[index];
    list[index] = list[next];
    list[next] = current;

    this.selectedUser = list[0];
    this.coResponsables = list.slice(1);

  }



  get canAccept(): boolean {



    return (

      this.responsablesForSummary.length > 0 &&

      this.standbyWeeks.length > 0

    );



  }



  get canSave(): boolean {



    return this.scheduleService.hasDraft;



  }



  acceptSelection(): void {



    if (!this.canAccept) {

      return;

    }



    this.showAcceptConfirmAlert = true;



  }



  confirmAcceptSelection(): void {



    this.showAcceptConfirmAlert = false;

    this.persistAcceptedSelection();



  }



  onCancelAcceptConfirm(): void {



    this.showAcceptConfirmAlert = false;

    this.startAddCoResponsable();



  }



  closeAcceptConfirmAlert(): void {



    this.showAcceptConfirmAlert = false;



  }



  private persistAcceptedSelection(): void {



    const responsables = this.responsablesForSummary.filter(

      name =>

        !this.addingToExistingWeek?.responsables.includes(

          name

        )

    );



    if (!responsables.length) {

      return;

    }



    const sourceApps =
      this.addingToExistingWeek?.aplicaciones?.length
        ? this.addingToExistingWeek.aplicaciones
        : this.appsForProgramming;

    if (!sourceApps.length) {

      return;

    }



    const apps: StandbyAssociatedApp[] = sourceApps.map(app => ({

      codigoAplicacion: app.codigoAplicacion,

      nombreAplicacion: app.nombreAplicacion

    }));



    const already =
      this.addingToExistingWeek?.responsables.length ?? 0;

    responsables.forEach((responsable, index) => {

      this.scheduleService.acceptWeeks(

        responsable,

        this.standbyWeeks,

        apps,

        {
          prioridad: this.usesPriority ? already + index + 1 : undefined,
          observacion: this.observacion.trim(),
          quierePrioridad: this.usesPriority
        }

      );

    });



    this.calendar?.clearSelection();

    this.selectedWeekStarts = [];

    this.coResponsables = [];

    this.observacion = '';

    this.quierePrioridad = null;

    this.askingPriority = false;

    this.addingCoResponsable = false;

    this.addingToExistingWeek = null;

    if (this.isProgramAll) {
      this.productStates.clear();
    } else {
      this.productStates.delete(this.activeAppCodigo);
    }



    this.showAcceptAlert = true;



  }



  closeAcceptAlert(): void {



    this.showAcceptAlert = false;



  }



  save(): void {



    if (!this.canSave) {

      return;

    }



    const apps = this.sessionApps;

    const first = apps[0];



    this.scheduleService.save();

    this.saved.emit({

      appCodigo: first?.codigoAplicacion ?? '',

      appNombre: first?.nombreAplicacion ?? ''

    });

    this.close();



  }



  closeSaveAlert(): void {



    this.showSaveAlert = false;

    this.close();



  }



  close(): void {



    this.resetModalState();

    this.closed.emit();



  }



  private persistActiveProductState(): void {



    const codigo = this.activeAppCodigo;

    if (!codigo) {

      return;

    }



    this.productStates.set(codigo, {

      selectedUser: this.selectedUser,

      coResponsables: [...this.coResponsables],

      selectedWeekStarts: this.selectedWeekStarts.map(

        date => new Date(date)

      )

    });



  }



  private focusUsersForCoResponsable(): void {



    setTimeout(() => {

      this.usersSection?.nativeElement.scrollIntoView({

        behavior: 'smooth',

        block: 'start'

      });

      this.userSearchInput?.nativeElement.focus({

        preventScroll: true

      });

    }, 0);



  }



  private restoreProductState(codigo: string): void {

    if (!codigo) {
      this.selectedUser = undefined;
      this.coResponsables = [];
      this.selectedWeekStarts = [];
      this.calendar?.clearSelection();
      return;
    }

    const state = this.productStates.get(codigo);



    this.selectedUser = state?.selectedUser;

    this.coResponsables = state?.coResponsables

      ? [...state.coResponsables]

      : [];

    this.selectedWeekStarts = state?.selectedWeekStarts

      ? state.selectedWeekStarts.map(

          date => new Date(date)

        )

      : [];



    if (this.selectedWeekStarts.length > 0) {

      this.calendar?.setSelection(

        this.selectedWeekStarts

      );

    } else {

      this.calendar?.clearSelection();

    }



  }



  private resetModalState(): void {

    this.sessionApps = this.aplicaciones().map(app => ({ ...app }));

    this.activeAppIndex = 0;

    this.programMode = this.sessionApps.length > 1 ? 'all' : 'single';

    this.productStates.clear();

    this.selectedUser = undefined;

    this.coResponsables = [];

    this.addingCoResponsable = false;

    this.addingToExistingWeek = null;

    this.selectedWeekStarts = [];

    this.userSearch = '';

    this.showAcceptConfirmAlert = false;

    this.closeAddAppMenu();

    this.calendar?.clearSelection();

    this.hydrateFromExistingDrafts();

  }

  /** Precarga responsable si ya hay semanas en borrador (modo edición). */
  private hydrateFromExistingDrafts(): void {

    const codes = new Set(
      this.sessionApps.map(app => app.codigoAplicacion)
    );

    const drafts = this.scheduleService.draftAssignments.filter(
      assignment =>
        assignment.aplicaciones?.some(app =>
          codes.has(app.codigoAplicacion)
        )
    );

    if (drafts.length === 0) {
      return;
    }

    this.selectedUser = drafts[0].responsable;

  }



}