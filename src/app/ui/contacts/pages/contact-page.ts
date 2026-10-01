import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ContactoModalComponent }
from '../../components/contacto-modal/contacto-modal';

import { NuevoContactoModalComponent }
from '../../components/nuevo-contacto-modal/nuevo-contacto-modal';

import { PhoneInputComponent }
from '../../../../shared/components/phone-input/phone-input';

import { PortalFilterBarComponent }
from '../../../../shared/components/portal-filter-bar/portal-filter-bar';

import { Contacto }
from '../../models/contacto.model';

import { ContactosService }
from '../../services/contactos.service';

import { SaveSuccessService }
from '../../../../shared/services/save-success.service';

@Component({
  selector: 'app-contactos-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ContactoModalComponent,
    NuevoContactoModalComponent,
    PhoneInputComponent,
    PortalFilterBarComponent
  ],
  templateUrl: './contactos-page.html',
  styleUrl: './contactos-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactosPageComponent {

  private readonly fb = inject(FormBuilder);

  readonly contactosService = inject(ContactosService);

  private readonly saveSuccess = inject(SaveSuccessService);

  readonly searchForm = this.fb.group({
    searchApp: ['']
  });

  readonly bulkForm = this.fb.group({
    celular: [''],
    correo: ['', Validators.email]
  });

  readonly showModal = signal(false);
  readonly showNewContactModal = signal(false);
  readonly selectedContacto = signal<Contacto | null>(null);
  readonly contactoToDelete = signal<Contacto | null>(null);
  readonly showDeleteConfirm = signal(false);
  readonly selectedIds = signal(new Set<number>());
  readonly showBulkEdit = signal(false);

  /** Se sincroniza con bulkForm para OnPush + canSaveBulk. */
  private readonly bulkFormValue = signal({
    celular: '',
    correo: ''
  });

  readonly selectedCount = computed(() =>
    this.selectedIds().size
  );

  readonly allFilteredSelected = computed(() => {

    const list = this.contactosService.filteredContactos();

    return (
      list.length > 0 &&
      list.every(c => this.selectedIds().has(c.id))
    );

  });

  readonly canSaveBulk = computed(() => {

    const values = this.bulkFormValue();

    return Boolean(
      values.celular?.trim() ||
      values.correo?.trim()
    );

  });

  constructor() {

    this.searchForm.controls.searchApp.valueChanges.subscribe(
      value => {
        this.contactosService.searchApp.set(value ?? '');
      }
    );

    this.bulkForm.valueChanges.subscribe(values => {
      this.bulkFormValue.set({
        celular: values.celular ?? '',
        correo: values.correo ?? ''
      });
    });

  }

  isSelected(id: number): boolean {

    return this.selectedIds().has(id);

  }

  toggleContacto(id: number): void {

    const next = new Set(this.selectedIds());

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    this.selectedIds.set(next);

  }

  toggleSelectAll(): void {

    const list = this.contactosService.filteredContactos();
    const next = new Set(this.selectedIds());

    if (this.allFilteredSelected()) {
      for (const contacto of list) {
        next.delete(contacto.id);
      }
    } else {
      for (const contacto of list) {
        next.add(contacto.id);
      }
    }

    this.selectedIds.set(next);

  }

  clearSelection(): void {

    this.selectedIds.set(new Set());

  }

  openBulkEdit(): void {

    if (this.selectedCount() === 0) {
      return;
    }

    this.bulkForm.reset({ celular: '', correo: '' });
    this.bulkFormValue.set({ celular: '', correo: '' });
    this.showBulkEdit.set(true);

  }

  closeBulkEdit(): void {

    this.showBulkEdit.set(false);

  }

  saveBulkEdit(): void {

    if (!this.canSaveBulk()) {
      return;
    }

    const values = this.bulkForm.getRawValue();

    this.contactosService.bulkUpdate(
      this.selectedIds(),
      {
        celular: values.celular?.trim(),
        correo: values.correo?.trim()
      }
    );

    this.showBulkEdit.set(false);
    this.clearSelection();
    this.saveSuccess.show({
      title: '¡Listo!',
      message: 'Los contactos se actualizaron.'
    });

  }

  openEditModal(contacto: Contacto): void {

    this.selectedContacto.set(contacto);
    this.showModal.set(true);

  }

  closeEditModal(): void {

    this.showModal.set(false);
    this.selectedContacto.set(null);

  }

  askDeleteContacto(contacto: Contacto): void {

    this.contactoToDelete.set(contacto);
    this.showDeleteConfirm.set(true);

  }

  cancelDelete(): void {

    this.showDeleteConfirm.set(false);
    this.contactoToDelete.set(null);

  }

  confirmDelete(): void {

    const contacto = this.contactoToDelete();

    if (!contacto) {
      return;
    }

    this.contactosService.deleteContacto(contacto.id);

    const next = new Set(this.selectedIds());
    next.delete(contacto.id);
    this.selectedIds.set(next);

    this.cancelDelete();

  }

  openNewContactModal(): void {

    this.showNewContactModal.set(true);

  }

  closeNewContactModal(): void {

    this.showNewContactModal.set(false);

  }

}
