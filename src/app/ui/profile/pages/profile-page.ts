import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PERFIL_STANDBY_MOCK }
from '../../mocks/perfil-standby.mock';

import { StandbyAssignment }
from '../../../stanby/models/standby-assignment.model';

import { StandbyScheduleService }
from '../../../stanby/services/standby-schedule.service';

import { StandbyMonthViewComponent }
from '../../../stanby/components/standby-month-view/standby-month-view';

import { UserProfileService }
from '../../services/user-profile.service';

import { SaveSuccessService }
from '../../../../shared/services/save-success.service';

type PerfilTab =
  | 'proximos'
  | 'historial';

type StandbyPeriod =
  | 'past'
  | 'current'
  | 'next';

const STANDBY_PERIOD_COLORS: Record<StandbyPeriod, string> = {
  past: '#9ca3af',
  current: '#00c389',
  next: '#59cbeb'
};

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    StandbyMonthViewComponent
  ],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilPageComponent {

  private readonly fb = inject(FormBuilder);

  readonly profileService = inject(UserProfileService);

  private readonly saveSuccess = inject(SaveSuccessService);

  private readonly scheduleService =
    inject(StandbyScheduleService);

  readonly pageSize = 2;

  readonly activeTab = signal<PerfilTab>('proximos');

  readonly proximosPage = signal(1);

  readonly historialPage = signal(1);

  readonly profileForm = this.fb.group({
    celular: ['', Validators.required]
  });

  readonly myStandby = computed(() => {

    const saved =
      this.scheduleService.getByResponsable(
        this.profileService.profile().nombre
      );

    const source =
      saved.length > 0
        ? saved
        : PERFIL_STANDBY_MOCK;

    return source.map(assignment => ({
      ...assignment,
      color: STANDBY_PERIOD_COLORS[
        this.standbyPeriod(assignment)
      ]
    }));

  });

  readonly upcomingStandby = computed(() => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.myStandby()
      .filter(assignment => assignment.fechaFin >= today)
      .sort(
        (a, b) =>
          a.fechaInicio.getTime() -
          b.fechaInicio.getTime()
      );

  });

  readonly pastStandby = computed(() => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.myStandby()
      .filter(assignment => assignment.fechaFin < today)
      .sort(
        (a, b) =>
          b.fechaInicio.getTime() -
          a.fechaInicio.getTime()
      );

  });

  readonly pagedUpcoming = computed(() =>
    this.pageItems(this.upcomingStandby(), this.proximosPage())
  );

  readonly pagedPast = computed(() =>
    this.pageItems(this.pastStandby(), this.historialPage())
  );

  readonly upcomingTotalPages = computed(() =>
    this.totalPages(this.upcomingStandby().length)
  );

  readonly historialTotalPages = computed(() =>
    this.totalPages(this.pastStandby().length)
  );

  readonly nextStandby = computed(() =>
    this.upcomingStandby()[0]
  );

  constructor() {

    this.profileForm.valueChanges.subscribe(values => {

      if (!this.profileService.editing()) {
        return;
      }

      this.profileService.updateDraft({
        celular: values.celular ?? ''
      });

    });

  }

  selectTab(tab: PerfilTab): void {

    this.activeTab.set(tab);

  }

  standbyPeriod(assignment: StandbyAssignment): StandbyPeriod {

    const now = new Date();
    const currentKey =
      now.getFullYear() * 12 + now.getMonth();
    const assignKey =
      assignment.fechaInicio.getFullYear() * 12 +
      assignment.fechaInicio.getMonth();

    if (assignKey < currentKey) {
      return 'past';
    }

    if (assignKey === currentKey) {
      return 'current';
    }

    return 'next';

  }

  startEdit(): void {

    this.profileService.startEdit();
    this.profileForm.patchValue({
      celular: this.profileService.draft().celular
    });

  }

  cancelEdit(): void {

    this.profileService.cancelEdit();
    this.profileForm.patchValue({
      celular: this.profileService.profile().celular
    });

  }

  saveEdit(): void {

    if (this.profileForm.invalid) {
      return;
    }

    this.profileService.saveEdit();
    this.saveSuccess.show({
      title: '¡Listo!',
      message: 'Tu perfil se actualizó.'
    });

  }

  previousProximosPage(): void {

    if (this.proximosPage() > 1) {
      this.proximosPage.update(page => page - 1);
    }

  }

  nextProximosPage(): void {

    if (this.proximosPage() < this.upcomingTotalPages()) {
      this.proximosPage.update(page => page + 1);
    }

  }

  previousHistorialPage(): void {

    if (this.historialPage() > 1) {
      this.historialPage.update(page => page - 1);
    }

  }

  nextHistorialPage(): void {

    if (this.historialPage() < this.historialTotalPages()) {
      this.historialPage.update(page => page + 1);
    }

  }

  private pageItems(
    items: StandbyAssignment[],
    page: number
  ): StandbyAssignment[] {

    const start = (page - 1) * this.pageSize;

    return items.slice(
      start,
      start + this.pageSize
    );

  }

  private totalPages(count: number): number {

    return Math.max(
      1,
      Math.ceil(count / this.pageSize)
    );

  }

}
