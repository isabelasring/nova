import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';

import { StandbyMonthViewComponent }
from '../../../standby/components/standby-month-view/standby-month-view';

import { StandbyScheduleService }
from '../../../standby/services/standby-schedule-service';

import { PhoneInputComponent }
from '../../../shared/components/phone-input/phone-input';

import { OptionSelectComponent }
from '../../../shared/components/option-select/option-select';

import { Contact }
from '../../models/contact-model';

import { ContactsService }
from '../../services/contacts-service';

import { SaveSuccessService }
from '../../../shared/services/save-success-service';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  templateUrl: './contact-modal.html',
  styleUrls: ['./contact-modal.scss'],
  imports: [
    StandbyMonthViewComponent,
    ReactiveFormsModule,
    PhoneInputComponent,
    OptionSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactModalComponent {

  readonly visible = input(false);

  readonly contacto = input<Contact | null>(null);

  readonly editMode = input(false);

  readonly closed = output<void>();

  private readonly scheduleService =
    inject(StandbyScheduleService);

  private readonly contactsService =
    inject(ContactsService);

  private readonly saveSuccess =
    inject(SaveSuccessService);

  readonly standbyAssignments = computed(() => {

    const codigo =
      this.contacto()?.codigoAplicacion;

    if (!codigo) {
      return [];
    }

    return this.scheduleService.getByAppCodigo(codigo);

  });

  private readonly router = inject(Router);

  private readonly fb = inject(FormBuilder);

  readonly contactoForm = this.fb.group({
    celular: [''],
    correoTeams: ['']
  });

  activeTab:
    | 'detalle'
    | 'contacto'
    | 'standby'
    | 'mantenimiento' = 'detalle';

  constructor() {

    effect(() => {

      if (!this.visible()) {
        return;
      }

      this.activeTab = this.editMode()
        ? 'contacto'
        : 'detalle';

      this.contactoForm.patchValue({
        celular: this.contacto()?.celular ?? '',
        correoTeams:
          `${(this.contacto()?.codigoAplicacion ?? 'app').toLowerCase()}@bancolombia.com.co`
      });

      if (this.editMode()) {
        this.contactoForm.enable();
      } else {
        this.contactoForm.disable();
      }

    });

  }

  get canEditContactoTab(): boolean {

    return this.editMode();

  }

  close(): void {

    this.closed.emit();

  }

  saveContacto(): void {

    const current = this.contacto();

    if (!current) {
      return;
    }

    const values = this.contactoForm.getRawValue();

    this.contactsService.updateContact(current.id, {
      celular: values.celular?.trim() || current.celular
    });

    this.close();
    this.saveSuccess.show({
      title: '¡Listo!',
      message: 'El contacto se actualizó.'
    });

  }

  selectTab(
    tab:
      | 'detalle'
      | 'contacto'
      | 'standby'
      | 'mantenimiento'
  ): void {

    this.activeTab = tab;

  }

  goToStandby(): void {

    if (this.editMode()) {
      return;
    }

    this.close();

    this.router.navigate(
      ['/standby'],
      {
        queryParams: {
          app: this.contacto()?.codigoAplicacion ?? 'NU0113001'
        }
      }
    );

  }

  goToMaintenance(): void {

    if (this.editMode()) {
      return;
    }

    this.close();

    this.router.navigate(
      ['/maintenance'],
      {
        queryParams: {
          app: this.contacto()?.codigoAplicacion ?? 'NU0113001'
        }
      }
    );

  }

}