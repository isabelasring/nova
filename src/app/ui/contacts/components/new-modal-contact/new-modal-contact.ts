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
from '../../../../shared/components/phone-input/phone-input';

import { SaveSuccessService }
from '../../../../shared/services/save-success-service';

import { STANDBY_APPLICATIONS }
from '../../../stanby/mocks/standby-applications-mock';

import { ContactosService }
from '../../services/service-contacts';

@Component({
  selector: 'app-nuevo-contacto-modal',
  standalone: true,
  templateUrl: './new-modal-contact.html',
  styleUrl: './new-modal-contact.scss',
  imports: [
    ReactiveFormsModule,
    PhoneInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuevoContactoModalComponent {

  private readonly fb = inject(FormBuilder);

  private readonly contactosService =
    inject(ContactosService);

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

  readonly canSave = computed(() => {
    const values = this.formSnapshot();
    const celular = values.celular?.trim() ?? '';

    return Boolean(
      values.evc &&
      values.linea &&
      values.codigoAplicacion &&
      values.nombre?.trim() &&
      celular.length > 4 &&
      values.correo?.trim() &&
      values.horario &&
      this.form.controls.correo.valid
    );
  });

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
    });

    effect(() => {

      if (!this.visible()) {
        return;
      }

      this.resetForm();

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

  onAppChange(): void {

    const codigo =
      this.form.controls.codigoAplicacion.value;

    const app = this.applications.find(
      item => item.codigoAplicacion === codigo
    );

    if (!app) {
      return;
    }

    this.form.patchValue({
      evc: app.evc,
      linea: app.linea
    });

  }

  save(): void {

    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const app = this.applications.find(
      item =>
        item.codigoAplicacion === values.codigoAplicacion
    );

    if (!app) {
      return;
    }

    this.contactosService.addContacto({
      codigoAplicacion: app.codigoAplicacion,
      nombreAplicacion: app.nombreAplicacion,
      celular: values.celular.trim(),
      nombre: values.nombre.trim(),
      correo: values.correo.trim(),
      horario: values.horario,
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

  }

}