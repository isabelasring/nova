import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { CbButtonComponent }
from '../../../shared/components/cb-button/cb-button';

import { StandbyAssignment }
from '../../models/standby-assignment-model';

import { StandbyMonthViewComponent }
from '../standby-month-view/standby-month-view';

import { avatarToneForName }
from '../../../shared/utils/avatar-tone-utils';

type StandbyPeriod = 'past' | 'current' | 'next';

export interface StandbyRowDetail {
  fechaLabel: string;
  nombre: string;
  celular?: string;
  appCodes: string[];
  appNames: string[];
  bvc: string;
  ldc: string;
  celula: string;
  service: string;
  footerLabel: string;
}

type DetailTab = 'info' | 'standby';

@Component({
  selector: 'app-standby-view-modal',
  standalone: true,
  imports: [DatePipe, StandbyMonthViewComponent, CbButtonComponent],
  templateUrl: './standby-view-modal.html',
  styleUrl: './standby-view-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyViewModalComponent {

  readonly visible = input(false);

  readonly assignments = input<StandbyAssignment[]>([]);

  readonly aplicacionCodigo = input('');

  readonly aplicacionNombre = input('');

  readonly personName = input('');

  readonly personPhone = input('');

  readonly showPeopleList = input(true);

  readonly rowDetail = input<StandbyRowDetail | null>(null);

  /** Otras áreas: oculta bloque de aplicaciones. */
  readonly serviceMode = input(false);

  readonly closed = output<void>();

  readonly detailTab = signal<DetailTab>('info');

  readonly hasRowDetail = computed(
    () => this.rowDetail() !== null
  );

  readonly isPersonView = computed(
    () => this.personName().trim().length > 0
  );

  readonly personInitials = computed(() => {

    return this.personName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');

  });

  readonly personAvatarTone = computed(() =>
    avatarToneForName(this.personName())
  );

  readonly upcomingAssignments = computed(() => {

    const today = this.startOfDay(new Date());

    return this.assignments().filter(
      assignment =>
        this.startOfDay(assignment.fechaFin) >= today
    );

  });

  readonly pastAssignments = computed(() => {

    const today = this.startOfDay(new Date());

    return this.assignments()
      .filter(
        assignment =>
          this.startOfDay(assignment.fechaFin) < today
      )
      .reverse();

  });

  constructor() {

    effect(() => {
      if (this.visible()) {
        this.detailTab.set(this.hasRowDetail() ? 'info' : 'standby');
      }
    });

  }

  setDetailTab(tab: DetailTab): void {

    this.detailTab.set(tab);

  }

  close(): void {

    this.closed.emit();

  }

  standbyPeriod(
    assignment: StandbyAssignment
  ): StandbyPeriod {

    const today = this.startOfDay(new Date());
    const start = this.startOfDay(assignment.fechaInicio);
    const end = this.startOfDay(assignment.fechaFin);

    if (end < today) {
      return 'past';
    }

    if (start <= today && end >= today) {
      return 'current';
    }

    return 'next';

  }

  periodLabel(assignment: StandbyAssignment): string {

    const period = this.standbyPeriod(assignment);

    if (period === 'past') {
      return 'Finalizado';
    }

    if (period === 'current') {
      return 'En curso';
    }

    return 'Próximo';

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

}
