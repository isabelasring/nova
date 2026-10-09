import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { NgClass } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { STANDBY_APPLICATIONS }
from '../../standby/mocks/standby-applications-mock';

import { StandbyApplication }
from '../../standby/models/standby-application-model';

import {
  MaintenanceWindow,
  MaintenanceWindowType,
  TipoVentanaForm
} from '../models/maintenance-windows-model';

import { MaintenanceService }
from '../services/maintenance-service';

import { SaveSuccessService }
from '../../shared/services/save-success-service';

import { PortalFilterService }
from '../../shared/services/portal-filter-service';

import { PortalFilterBarComponent }
from '../../shared/components/portal-filter-bar/portal-filter-bar';

import { BreadcrumbComponent, BreadcrumbItem }
from '../../shared/components/breadcrumb/breadcrumb';

import { DateFieldComponent }
from '../../shared/components/date-field/date-field';

import { SearchFieldComponent }
from '../../shared/components/search-field/search-field';

import { OptionSelectComponent }
from '../../shared/components/option-select/option-select';

import { PagerComponent, pageSlice }
from '../../shared/components/pager/pager';

import { DownloadTrayService }
from '../../shared/services/download-tray-service';

@Component({
  selector: 'app-maintenance-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    PortalFilterBarComponent,
    BreadcrumbComponent,
    DateFieldComponent,
    SearchFieldComponent,
    OptionSelectComponent,
    PagerComponent
  ],
  templateUrl: './maintenance-page.html',
  styleUrl: './maintenance-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenancePageComponent {

  private readonly fb = inject(FormBuilder);

  readonly maintenance = inject(MaintenanceService);

  readonly listPage = signal(1);

  readonly listPageSize = signal(10);

  readonly pagedWindows = computed(() =>
    pageSlice(
      this.displayWindows(),
      this.listPage(),
      this.listPageSize()
    )
  );

  private readonly saveSuccess = inject(SaveSuccessService);

  private readonly portalFilter = inject(PortalFilterService);

  private readonly downloads = inject(DownloadTrayService);

  readonly applications: StandbyApplication[] =
    STANDBY_APPLICATIONS.map(app => ({ ...app }));

  readonly viewMode = signal<'list' | 'form'>('list');

  readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    if (this.viewMode() === 'form') {
      return [
        { label: 'Ventana de mantenimiento', link: '/maintenance' },
        { label: 'Nueva ventana' }
      ];
    }

    return [{ label: 'Ventana de mantenimiento' }];
  });

  readonly selectedApp = signal<StandbyApplication | undefined>(
    undefined
  );

  readonly filterEvc = signal('');
  readonly filterLinea = signal('');
  readonly searchApp = signal('');

  readonly formRevision = signal(0);

  readonly showEditPanel = signal(false);

  readonly showTypeModal = signal(false);

  readonly showSaveToast = signal(false);

  readonly highlightedWindowId = signal<number | null>(null);

  readonly flippedWindowId = signal<number | null>(null);

  private saveToastTimer: ReturnType<typeof setTimeout> | null = null;

  private highlightTimer: ReturnType<typeof setTimeout> | null = null;

  private static readonly CRQ_PATTERN = /^CRQ-\d{5}$/i;

  readonly editingWindow = signal<MaintenanceWindow | undefined>(
    undefined
  );

  readonly createForm = this.fb.group({
    tipoVentana: ['' as TipoVentanaForm],
    crq: [''],
    estado: ['Programada'],
    frecuencia: ['Semanal'],
    fechaInicio: ['2026-08-20T22:00', Validators.required],
    fechaFin: ['2026-08-21T02:00', Validators.required],
    zonaHoraria: ['América / Bogotá'],
    impacto: ['Servicio degradado durante la ventana'],
    observacion: ['']
  });

  readonly editForm = this.fb.group({
    estado: [''],
    frecuencia: [''],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    zonaHoraria: [''],
    impacto: [''],
    observacion: [''],
    aplicacion: [{ value: '', disabled: true }],
    nombreAplicacion: [{ value: '', disabled: true }],
    evc: [{ value: '', disabled: true }],
    linea: [{ value: '', disabled: true }]
  });

  readonly celulaOptions = computed(() =>
    [
      ...new Set(this.applications.map(app => app.celula))
    ].sort()
  );

  readonly ldcOptions = computed(() =>
    [
      ...new Set(this.applications.map(app => app.ldc))
    ].sort()
  );

  readonly filteredApplications = computed(() => {

    this.formRevision();
    this.portalFilter.filters();

    const term = this.searchApp().trim().toLowerCase();
    const celula = this.filterEvc();
    const ldc = this.filterLinea();
    const hasLocal = Boolean(term || celula || ldc);
    const hasPortal = this.portalFilter.hasActiveFilters();

    if (!hasLocal && !hasPortal) {
      return [];
    }

    return this.applications.filter(app => {

      if (!this.portalFilter.matches(app)) {
        return false;
      }

      const matchCelula = !celula || app.celula === celula;
      const matchLdc = !ldc || app.ldc === ldc;
      const matchSearch =
        !term ||
        app.codigoAplicacion
          .toLowerCase()
          .includes(term) ||
        app.nombreAplicacion
          .toLowerCase()
          .includes(term);

      return matchCelula && matchLdc && matchSearch;

    });

  });

  readonly hasActiveAppFilters = computed(() =>
    Boolean(
      this.searchApp().trim() ||
      this.filterEvc() ||
      this.filterLinea() ||
      this.portalFilter.hasActiveFilters()
    )
  );

  readonly isVentanaProgramada = computed(() => {
    this.formRevision();
    return this.createForm.controls.tipoVentana.value === 'programada';
  });

  readonly isPromesaServicio = computed(() => {
    this.formRevision();
    return this.createForm.controls.tipoVentana.value === 'promesa';
  });

  readonly canFillFormFields = computed(() => {
    this.formRevision();
    const tipo = this.createForm.controls.tipoVentana.value;

    if (!tipo) {
      return false;
    }

    if (tipo === 'promesa') {
      return true;
    }

    return this.isCrqValid();
  });

  readonly isCrqValid = computed(() => {
    this.formRevision();
    const value = this.createForm.controls.crq.value?.trim() ?? '';
    return MaintenancePageComponent.CRQ_PATTERN.test(value);
  });

  readonly isCrqInvalid = computed(() => {
    this.formRevision();
    const value = this.createForm.controls.crq.value?.trim() ?? '';
    return value.length > 0 && !this.isCrqValid();
  });

  readonly canSave = computed(() => {
    this.formRevision();
    return (
      this.canFillFormFields() &&
      !!this.selectedApp() &&
      this.createForm.valid
    );
  });

  readonly canSaveEdit = computed(() => {
    this.formRevision();
    return !!this.editingWindow() && this.editForm.valid;
  });

  readonly createPreview = computed(() => {
    this.formRevision();
    return this.createForm.getRawValue();
  });

  readonly hasTipoVentana = computed(() => {
    this.formRevision();
    return !!this.createForm.controls.tipoVentana.value;
  });

  readonly displayWindows = computed(() => {

    const list = this.maintenance.filteredWindows();
    const highlightId = this.highlightedWindowId();

    if (!highlightId) {
      return list;
    }

    const index = list.findIndex(window => window.id === highlightId);

    if (index <= 0) {
      return list;
    }

    const highlighted = list[index];

    return [
      highlighted,
      ...list.slice(0, index),
      ...list.slice(index + 1)
    ];

  });

  readonly statusClass = MaintenanceService.statusClass;

  readonly formatPreview = MaintenanceService.formatDateTime;

  constructor() {

    this.createForm.valueChanges.subscribe(() => {
      this.formRevision.update(v => v + 1);
    });

    this.editForm.valueChanges.subscribe(() => {
      this.formRevision.update(v => v + 1);
    });

  }

  setListFilter(
    field: 'searchApp',
    value: string
  ): void {

    this.maintenance.listSearchApp.set(value);

  }

  openForm(): void {

    this.closeEditPanel();
    this.resetCreateForm();
    this.showTypeModal.set(true);

  }

  closeTypeModal(): void {

    this.showTypeModal.set(false);
    this.resetCreateForm();

  }

  cancelForm(): void {

    this.closeTypeModal();

  }

  selectApp(app: StandbyApplication): void {

    this.selectedApp.set(app);

  }

  selectTipoVentana(tipo: 'programada' | 'promesa'): void {

    this.createForm.patchValue({
      tipoVentana: tipo,
      crq: ''
    });
    this.selectedApp.set(undefined);
    this.filterEvc.set('');
    this.filterLinea.set('');
    this.searchApp.set('');
    this.formRevision.update(v => v + 1);

  }

  changeTipoVentana(): void {

    this.createForm.patchValue({
      tipoVentana: '' as TipoVentanaForm,
      crq: ''
    });
    this.selectedApp.set(undefined);
    this.filterEvc.set('');
    this.filterLinea.set('');
    this.searchApp.set('');
    this.formRevision.update(v => v + 1);

  }

  updateAppFilter(
    field: 'evc' | 'linea' | 'searchApp',
    value: string
  ): void {

    if (field === 'evc') {
      this.filterEvc.set(value);
      return;
    }

    if (field === 'linea') {
      this.filterLinea.set(value);
      return;
    }

    this.searchApp.set(value);

  }

  toggleTipoFilter(tipo: MaintenanceWindowType): void {

    this.maintenance.listFilterTipo.set(tipo);

  }

  clearTipoFilter(): void {

    this.maintenance.listFilterTipo.set('');

  }

  toggleEstadoFilter(estado: string): void {

    this.maintenance.listFilterEstado.set(estado);

  }

  clearEstadoFilter(): void {

    this.maintenance.listFilterEstado.set('');

  }

  tipoLabel(tipo: MaintenanceWindowType): string {

    return tipo === 'Ventana programada'
      ? 'Programada'
      : 'Promesa de servicio';

  }

  downloadWindows(): void {

    const rows: string[][] = [[
      'Aplicación',
      'Nombre',
      'Inicio',
      'Fin',
      'Estado',
      'Frecuencia',
      'Célula'
    ]];

    for (const window of this.displayWindows()) {
      rows.push([
        window.aplicacion,
        window.nombreAplicacion,
        window.fechaInicio,
        window.fechaFin,
        window.estado,
        window.frecuencia,
        window.celula
      ]);
    }

    this.downloads.enqueue(
      'ventanas.csv',
      () => DownloadTrayService.csv(rows)
    );

  }

  isPromesa(window: MaintenanceWindow): boolean {

    return window.tipo === 'Promesa de servicio';

  }

  toggleWindowFlip(id: number): void {

    this.flippedWindowId.update(current =>
      current === id ? null : id
    );

  }

  openEditPanel(
    window: MaintenanceWindow,
    event: Event
  ): void {

    event.stopPropagation();

    this.editingWindow.set(window);
    this.editForm.patchValue({
      estado: window.estado,
      frecuencia: window.frecuencia,
      fechaInicio: window.fechaInicio,
      fechaFin: window.fechaFin,
      zonaHoraria: window.zonaHoraria,
      impacto: window.impacto,
      observacion: window.observacion,
      aplicacion: window.aplicacion,
      nombreAplicacion: window.nombreAplicacion,
      evc: window.evc,
      linea: window.linea
    });
    this.showEditPanel.set(true);

  }

  closeEditPanel(): void {

    this.showEditPanel.set(false);
    this.editingWindow.set(undefined);

  }

  saveEdit(): void {

    const window = this.editingWindow();

    if (!this.canSaveEdit() || !window || this.editForm.invalid) {
      return;
    }

    const values = this.editForm.getRawValue();
    const savedId = window.id;

    this.maintenance.updateWindow(window.id, {
      estado: values.estado ?? window.estado,
      frecuencia: values.frecuencia ?? window.frecuencia,
      fechaInicio: MaintenanceService.formatDateTime(
        values.fechaInicio ?? window.fechaInicio
      ),
      fechaFin: MaintenanceService.formatDateTime(
        values.fechaFin ?? window.fechaFin
      ),
      zonaHoraria: values.zonaHoraria ?? window.zonaHoraria,
      impacto: values.impacto ?? window.impacto,
      observacion: values.observacion ?? window.observacion
    });

    this.closeEditPanel();
    this.focusSavedWindow(savedId);
    this.saveSuccess.show({
      title: '¡Listo!',
      message: 'La ventana se actualizó.'
    });

  }

  saveMaintenanceWindow(): void {

    const app = this.selectedApp();

    if (!this.canSave() || !app || this.createForm.invalid) {
      return;
    }

    const values = this.createForm.getRawValue();
    const isProgramada = values.tipoVentana === 'programada';
    const tipo = isProgramada
      ? 'Ventana programada' as const
      : 'Promesa de servicio' as const;
    const estado = values.estado ?? 'Programada';

    const newId = Date.now();

    this.maintenance.addWindow({
      id: newId,
      aplicacion: app.codigoAplicacion,
      nombreAplicacion: app.nombreAplicacion,
      bvc: app.bvc,
      ldc: app.ldc,
      celula: app.celula,
      service: app.service,
      evc: app.celula,
      linea: app.ldc,
      frecuencia: values.frecuencia ?? 'Semanal',
      fechaInicio: MaintenanceService.formatDateTime(
        values.fechaInicio ?? ''
      ),
      fechaFin: MaintenanceService.formatDateTime(
        values.fechaFin ?? ''
      ),
      zonaHoraria: values.zonaHoraria ?? 'América / Bogotá',
      estado,
      impacto: values.impacto ?? '',
      observacion: values.observacion?.trim() ?? '',
      tipo,
      crq: isProgramada
        ? values.crq?.trim()
        : undefined
    });

    this.maintenance.listFilterTipo.set(tipo);
    this.maintenance.listFilterEstado.set(estado);
    this.maintenance.listSearchApp.set('');

    this.showTypeModal.set(false);
    this.viewMode.set('list');
    this.resetCreateForm();
    this.focusSavedWindow(newId);
    this.saveSuccess.show({
      title: '¡Listo!',
      message: 'La ventana se guardó.'
    });

  }

  dismissSaveToast(): void {

    this.showSaveToast.set(false);

    if (this.saveToastTimer) {
      clearTimeout(this.saveToastTimer);
      this.saveToastTimer = null;
    }

  }

  private focusSavedWindow(id: number): void {

    if (this.highlightTimer) {
      clearTimeout(this.highlightTimer);
    }

    this.highlightedWindowId.set(id);

    setTimeout(() => {
      const element = document.getElementById(`window-card-${id}`);

      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 80);

    this.highlightTimer = setTimeout(() => {
      this.highlightedWindowId.set(null);
      this.highlightTimer = null;
    }, 5000);

  }

  private showSaveSuccessToast(): void {

    this.dismissSaveToast();
    this.showSaveToast.set(true);

    this.saveToastTimer = setTimeout(() => {
      this.showSaveToast.set(false);
      this.saveToastTimer = null;
    }, 4000);

  }

  private resetCreateForm(): void {

    this.selectedApp.set(undefined);
    this.filterEvc.set('');
    this.filterLinea.set('');
    this.searchApp.set('');
    this.createForm.reset({
      tipoVentana: '' as TipoVentanaForm,
      crq: '',
      estado: 'Programada',
      frecuencia: 'Semanal',
      fechaInicio: '2026-08-20T22:00',
      fechaFin: '2026-08-21T02:00',
      zonaHoraria: 'América / Bogotá',
      impacto: 'Servicio degradado durante la ventana',
      observacion: ''
    });
    this.formRevision.update(v => v + 1);

  }

}