import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PhoneInputComponent }
from '../../../shared/components/phone-input/phone-input';

import { SaveSuccessService }
from '../../../shared/services/save-success-service';

import { STANDBY_APPLICATIONS }
from '../../../standby/mocks/standby-applications-mock';

import { ContactsService }
from '../../services/contacts-service';

@Component({
  selector: 'app-new-contact-modal',
  standalone: true,
  templateUrl: './new-contact-modal.html',
  styleUrl: './new-contact-modal.scss',
  imports: [
    ReactiveFormsModule,
    PhoneInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewContactModalComponent {

  private readonly fb = inject(FormBuilder);

  private readonly contactsService =
    inject(ContactsService);

  private readonly saveSuccess =
    inject(SaveSuccessService);

  readonly visible = input(false);

  readonly closed = output<void>();

  readonly saved = output<void>();

  private readonly applications =
    STANDBY_APPLICATIONS;

  readonly form = this.fb.nonNullable.group({
    evc: ['', Validators.required],
    linea: ['', Validators.required],
    codigoAplicacion: ['', Validators.required],
    nombre: ['', Validators.required],
    celular: ['+57', Validators.required],
    correo: [
      '',
      [Validators.required, Validators.email]
    ],
    horario: ['24/7', Validators.required]
  });

  /** Snapshot del form para OnPush + computed. */
  private readonly formSnapshot = signal(
    this.form.getRawValue()
  );

  readonly formError = signal('');

  private wasOpen = false;

  readonly evcOptions = [
    ...new Set(this.applications.map(app => app.evc))
  ].sort();

  readonly lineaOptions = computed(() => {
    const evc = this.formSnapshot().evc;

    const list = this.applications.filter(app =>
      !evc || app.evc === evc
    );

    return [...new Set(list.map(app => app.linea))]
      .sort();
  });

  readonly appOptions = computed(() => {
    const { evc, linea } = this.formSnapshot();

    return this.applications.filter(app => {
      const matchEvc = !evc || app.evc === evc;
      const matchLinea = !linea || app.linea === linea;
      return matchEvc && matchLinea;
    });
  });

  constructor() {

    this.form.valueChanges.subscribe(() => {
      this.formSnapshot.set(this.form.getRawValue());
      this.formError.set('');
    });

    this.form.controls.codigoAplicacion.valueChanges.subscribe(
      codigo => this.syncApplication(codigo)
    );

    effect(() => {

      const open = this.visible();

      if (open && !this.wasOpen) {
        this.resetForm();
      }

      this.wasOpen = open;

    });

  }

  close(): void {

    this.closed.emit();

  }

  onEvcChange(): void {

    this.form.patchValue({
      linea: '',
      codigoAplicacion: ''
    });

  }

  onLineaChange(): void {

    this.form.patchValue({
      codigoAplicacion: ''
    });

  }

  onAppChange(event: Event): void {

    const codigo = (event.target as HTMLSelectElement).value;

    this.form.controls.codigoAplicacion.setValue(codigo);
    this.syncApplication(codigo);

  }

  save(): void {

    const values = this.form.getRawValue();
    const app = this.applications.find(
      item =>
        item.codigoAplicacion === values.codigoAplicacion
    );

    if (app) {
      this.form.patchValue({
        evc: app.evc,
        linea: app.linea
      }, { emitEvent: false });
    }

    const ready = this.form.getRawValue();

    if (!app || !this.isReady(ready)) {
      this.form.markAllAsTouched();
      this.formSnapshot.set(ready);
      this.formError.set(
        'Completa célula, LC, aplicación, nombre, un celular y un correo válido.'
      );
      return;
    }

    this.contactsService.addContact({
      codigoAplicacion: app.codigoAplicacion,
      nombreAplicacion: app.nombreAplicacion,
      celular: ready.celular.trim(),
      nombre: ready.nombre.trim(),
      correo: ready.correo.trim(),
      horario: ready.horario,
      bvc: app.bvc,
      ldc: app.ldc,
      celula: app.celula,
      service: app.service,
      evc: app.celula,
      linea: app.ldc
    });

    this.saved.emit();
    this.close();
    this.saveSuccess.show({
      title: '¡Listo!',
      message: 'El contacto se guardó.'
    });

  }

  private syncApplication(codigo: string): void {

    const app = this.applications.find(
      item => item.codigoAplicacion === codigo
    );

    if (!app) {
      return;
    }

    if (
      this.form.controls.evc.value === app.evc &&
      this.form.controls.linea.value === app.linea
    ) {
      return;
    }

    this.form.patchValue({
      evc: app.evc,
      linea: app.linea
    }, { emitEvent: false });

    this.formSnapshot.set(this.form.getRawValue());

  }

  private isReady(values: {
    evc: string;
    linea: string;
    codigoAplicacion: string;
    nombre: string;
    celular: string;
    correo: string;
    horario: string;
  }): boolean {

    const digits = (values.celular ?? '').replace(/\D/g, '');
    const correo = values.correo?.trim() ?? '';

    return Boolean(
      values.evc &&
      values.linea &&
      values.codigoAplicacion &&
      values.nombre?.trim() &&
      digits.length >= 7 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) &&
      values.horario
    );

  }

  private resetForm(): void {

    this.form.reset({
      evc: '',
      linea: '',
      codigoAplicacion: '',
      nombre: '',
      celular: '+57',
      correo: '',
      horario: '24/7'
    });

    this.formSnapshot.set(this.form.getRawValue());
    this.formError.set('');

  }

}