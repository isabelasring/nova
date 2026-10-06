import {
  computed,
  Injectable,
  inject,
  signal
} from '@angular/core';

import { Contact }
from '../models/contact-model';

import { CONTACTS_MOCK }
from '../mocks/contact-mock';

import { PortalFilterService }
from '../../shared/services/portal-filter-service';

export interface BulkContactUpdate {
  celular?: string;
  correo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  private readonly portalFilter =
    inject(PortalFilterService);

  private readonly contactsSource =
    signal<Contact[]>([...CONTACTS_MOCK]);

  readonly contacts = this.contactsSource.asReadonly();

  readonly searchApp = signal('');

  readonly filteredContacts = computed(() => {

    const term = this.searchApp().trim().toLowerCase();
    this.portalFilter.filters();

    return this.contacts().filter(contacto => {

      const matchPortal = this.portalFilter.matches({
        ...contacto,
        responsable: contacto.nombre
      });

      if (!matchPortal) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        contacto.codigoAplicacion
          .toLowerCase()
          .includes(term) ||
        contacto.nombreAplicacion
          .toLowerCase()
          .includes(term) ||
        contacto.nombre.toLowerCase().includes(term) ||
        contacto.celula.toLowerCase().includes(term) ||
        contacto.bvc.toLowerCase().includes(term)
      );

    });

  });

  addContact(
    data: Omit<Contact, 'id'>
  ): Contact {

    const nextId =
      this.contactsSource().reduce(
        (max, item) => Math.max(max, item.id),
        0
      ) + 1;

    const created: Contact = {
      id: nextId,
      ...data,
      horario: '24/7'
    };

    this.contactsSource.update(list => [
      created,
      ...list
    ]);

    return created;

  }

  updateContact(
    id: number,
    patch: Partial<Contact>
  ): void {

    this.contactsSource.update(list =>
      list.map(item =>
        item.id === id
          ? { ...item, ...patch, horario: '24/7' }
          : item
      )
    );

  }

  bulkUpdate(
    ids: Set<number>,
    patch: BulkContactUpdate
  ): void {

    this.contactsSource.update(list =>
      list.map(contacto => {

        if (!ids.has(contacto.id)) {
          return contacto;
        }

        return {
          ...contacto,
          ...(patch.celular ? { celular: patch.celular } : {}),
          ...(patch.correo ? { correo: patch.correo } : {})
        };

      })
    );

  }

  deleteContact(id: number): void {

    this.contactsSource.update(list =>
      list.filter(item => item.id !== id)
    );

  }

}
