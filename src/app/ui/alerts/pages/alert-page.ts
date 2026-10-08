import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BreadcrumbComponent }
from '../../shared/components/breadcrumb/breadcrumb';

import { SearchFieldComponent }
from '../../shared/components/search-field/search-field';

import { PagerComponent, pageSlice }
from '../../shared/components/pager/pager';

import { Alerta, AlertaSeveridad, AlertaVista }
from '../models/alert-model';

import { AlertsService }
from '../services/alert-service';

import { DownloadTrayService }
from '../../shared/services/download-tray-service';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [NgClass, FormsModule, BreadcrumbComponent, SearchFieldComponent, PagerComponent],
  templateUrl: './alert-page.html',
  styleUrl: './alert-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsPageComponent {

  readonly alertsService = inject(AlertsService);

  readonly listPage = signal(1);

  readonly listPageSize = signal(10);

  readonly pagedAlerts = computed(() =>
    pageSlice(
      this.alertsService.filteredAlerts(),
      this.listPage(),
      this.listPageSize()
    )
  );

  private readonly downloads = inject(DownloadTrayService);

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

  downloadAlerts(): void {

    const rows: string[][] = [[
      'Hora',
      'Severidad',
      'Estado',
      'Plataforma',
      'Problema',
      'Duración'
    ]];

    for (const alerta of this.alertsService.filteredAlerts()) {
      rows.push([
        alerta.hora,
        alerta.severidad,
        alerta.estado,
        alerta.detalle.plataforma,
        alerta.problema,
        alerta.duracion
      ]);
    }

    this.downloads.enqueue(
      'alertas.csv',
      () => DownloadTrayService.csv(rows)
    );

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
