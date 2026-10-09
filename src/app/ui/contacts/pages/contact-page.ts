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

import { ContactModalComponent }
from '../components/contact-modal/contact-modal';

import { NewContactModalComponent }
from '../components/new-contact-modal/new-contact-modal';

import { BreadcrumbComponent }
from '../../shared/components/breadcrumb/breadcrumb';

import { SearchFieldComponent }
from '../../shared/components/search-field/search-field';

import { PagerComponent, pageSlice }
from '../../shared/components/pager/pager';

import { PhoneInputComponent }
from '../../shared/components/phone-input/phone-input';

import { PortalFilterBarComponent }
from '../../shared/components/portal-filter-bar/portal-filter-bar';

import { Contact }
from '../models/contact-model';

import { ContactsService }
from '../services/contacts-service';

import { StandbyScheduleService }
from '../../standby/services/standby-schedule-service';

import { SaveSuccessService }
from '../../shared/services/save-success-service';

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ContactModalComponent,
    NewContactModalComponent,
    PhoneInputComponent,
    PortalFilterBarComponent,
    BreadcrumbComponent,
    SearchFieldComponent,
    PagerComponent
  ],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsPageComponent {

  private readonly fb = inject(FormBuilder);

  readonly contactsService = inject(ContactsService);

  readonly listPage = signal(1);

  readonly listPageSize = signal(10);

  readonly appGroups = computed(() => {

    const groups = new Map<string, Contact[]>();

    for (const contact of this.contactsService.filteredContacts()) {
      const current = groups.get(contact.codigoAplicacion) ?? [];
      current.push(contact);
      groups.set(contact.codigoAplicacion, current);
    }

    return [...groups.entries()].map(([codigo, contacts]) => ({
      codigo,
      nombre: contacts[0].nombreAplicacion,
      celula: contacts[0].celula,
      ldc: contacts[0].ldc,
      bvc: contacts[0].bvc,
      contacts,
      ids: contacts.map(item => item.id)
    }));

  });

  readonly pagedGroups = computed(() =>
    pageSlice(
      this.appGroups(),
      this.listPage(),
      this.listPageSize()
    )
  );

  private readonly standbySchedule = inject(StandbyScheduleService);

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
  readonly selectedContact = signal<Contact | null>(null);
  readonly contactoToDelete = signal<Contact | null>(null);
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

    const list = this.contactsService.filteredContacts();

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
        this.contactsService.searchApp.set(value ?? '');
      }
    );

    this.bulkForm.valueChanges.subscribe(values => {
      this.bulkFormValue.set({
        celular: values.celular ?? '',
        correo: values.correo ?? ''
      });
    });

  }

  standbyDe(codigoAplicacion: string): { nombre: string; celular: string }[] {

    const seen = new Set<string>();
    const people: { nombre: string; celular: string }[] = [];

    for (const assignment of this.standbySchedule.savedAssignments) {

      const covers = (assignment.aplicaciones ?? []).some(
        app => app.codigoAplicacion === codigoAplicacion
      );

      if (!covers || seen.has(assignment.responsable)) {
        continue;
      }

      seen.add(assignment.responsable);
      people.push({
        nombre: assignment.responsable,
        celular: assignment.celular
      });

    }

    return people;

  }

  isSelected(id: number): boolean {

    return this.selectedIds().has(id);

  }

  groupSelected(ids: number[]): boolean {

    return ids.length > 0 && ids.every(id => this.selectedIds().has(id));

  }

  toggleGroup(ids: number[]): void {

    const next = new Set(this.selectedIds());
    const allSelected = ids.every(id => next.has(id));

    for (const id of ids) {
      if (allSelected) {
        next.delete(id);
      } else {
        next.add(id);
      }
    }

    this.selectedIds.set(next);

  }

  toggleContact(id: number): void {

    const next = new Set(this.selectedIds());

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    this.selectedIds.set(next);

  }

  toggleSelectAll(): void {

    const list = this.contactsService.filteredContacts();
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

    this.contactsService.bulkUpdate(
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

  openEditModal(contacto: Contact): void {

    this.selectedContact.set(contacto);
    this.showModal.set(true);

  }

  closeEditModal(): void {

    this.showModal.set(false);
    this.selectedContact.set(null);

  }

  askDeleteContact(contacto: Contact): void {

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

    this.contactsService.deleteContact(contacto.id);

    const next = new Set(this.selectedIds());
    next.delete(contacto.id);
    this.selectedIds.set(next);

    this.cancelDelete();

  }

  openNewContactModal(): void {

    this.showNewContactModal.set(true);

  }

  onContactSaved(): void {

    this.searchForm.controls.searchApp.setValue('');
    this.contactsService.searchApp.set('');

  }

  closeNewContactModal(): void {

    this.showNewContactModal.set(false);

  }

}