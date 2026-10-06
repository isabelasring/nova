import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Alerta, AlertaSeveridad, AlertaVista }
from '../models/alert-model';

import { AlertsService }
from '../services/alert-service';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './alert-page.html',
  styleUrl: './alert-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsPageComponent {

  readonly alertsService = inject(AlertsService);

  private readonly selectedAlertId = signal<string | undefined>(undefined);

  private readonly commentsAlertId = signal<string | undefined>(undefined);

  readonly draftComment = signal('');

  readonly selectedAlert = computed(() => {
    const id = this.selectedAlertId();
    return id ? this.alertsService.getById(id) : undefined;
  });

  readonly commentsAlert = computed(() => {
    const id = this.commentsAlertId();
    return id ? this.alertsService.getById(id) : undefined;
  });

  readonly sheetClosing = signal(false);

  private sheetTimer: ReturnType<typeof setTimeout> | null = null;

  readonly severityClass = AlertsService.severityClass;

  readonly estadoClass = AlertsService.estadoClass;

  setFilterEstado(value: AlertaVista): void {
    this.alertsService.filterEstado.set(value);
    this.closeDetail();
    this.closeComments();
  }

  setFilterSeveridad(value: AlertaSeveridad | ''): void {
    this.alertsService.filterSeveridad.set(value);
  }

  openDetail(alerta: Alerta, event?: Event): void {

    if (event) {
      const target = event.target as HTMLElement;

      if (target.closest('.comments-btn')) {
        return;
      }
    }

    this.cancelSheetClose();
    this.sheetClosing.set(false);
    this.commentsAlertId.set(undefined);
    this.draftComment.set('');
    this.selectedAlertId.set(alerta.id);

  }

  openComments(alerta: Alerta, event: Event): void {
    event.stopPropagation();
    this.selectedAlertId.set(undefined);
    this.draftComment.set('');
    this.commentsAlertId.set(alerta.id);
  }

  closeDetail(): void {
    if (!this.selectedAlertId() || this.sheetClosing()) {
      return;
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion) {
      this.finishSheetClose();
      return;
    }

    this.sheetClosing.set(true);
    this.sheetTimer = setTimeout(() => this.finishSheetClose(), 320);
  }

  private finishSheetClose(): void {
    this.selectedAlertId.set(undefined);
    this.draftComment.set('');
    this.sheetClosing.set(false);
    this.sheetTimer = null;
  }

  private cancelSheetClose(): void {
    if (!this.sheetTimer) {
      return;
    }

    clearTimeout(this.sheetTimer);
    this.sheetTimer = null;
  }

  closeComments(): void {
    this.commentsAlertId.set(undefined);
    this.draftComment.set('');
  }

  submitComment(alertaId: string): void {
    const added = this.alertsService.addComment(
      alertaId,
      this.draftComment()
    );

    if (added) {
      this.draftComment.set('');
    }
  }

}
