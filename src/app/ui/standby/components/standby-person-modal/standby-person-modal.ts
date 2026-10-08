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

import { CappedSlotAdderComponent }
from '../capped-slot-adder/capped-slot-adder';

import { PhoneInputComponent }
from '../../../shared/components/phone-input/phone-input';

import { OptionSelectComponent }
from '../../../shared/components/option-select/option-select';

import { SaveSuccessService }
from '../../../shared/services/save-success-service';

import {
  STANDBY_EMPRESA_OPTIONS,
  STANDBY_SERVICE_OPTIONS,
  STANDBY_TI_SERVICE_OPTIONS,
  StandbyPersonRecord
} from '../../mocks/standby-person-catalog-mock';

@Component({
  selector: 'app-standby-person-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CappedSlotAdderComponent,
    PhoneInputComponent,
    OptionSelectComponent
  ],
  templateUrl: './standby-person-modal.html',
  styleUrl: './standby-person-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyPersonModalComponent {

  private readonly fb = inject(FormBuilder);

  private readonly saveSuccess = inject(SaveSuccessService);

  readonly visible = input(false);

  /** Otras áreas: sin servicios TI / apps. */
  readonly serviceMode = input(false);

  readonly closed = output<void>();

  readonly saved = output<StandbyPersonRecord>();

  readonly empresaOptions = [...STANDBY_EMPRESA_OPTIONS];

  readonly serviceOptions = STANDBY_SERVICE_OPTIONS;

  readonly tiOptions = STANDBY_TI_SERVICE_OPTIONS;

  readonly servicios = signal<string[]>([]);

  readonly serviciosTi = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    funcionario: ['', Validators.required],
    cedula: ['', Validators.required],
    celular: ['+57', Validators.required],
    empresa: ['', Validators.required],
    funcion: [''],
    observaciones: ['']
  });

  private readonly formSnapshot = signal(
    this.form.getRawValue()
  );

  readonly canSave = computed(() => {

    const values = this.formSnapshot();
    const celular = values.celular?.trim() ?? '';
    const needsTi = !this.serviceMode();

    return Boolean(
      values.funcionario.trim() &&
      values.cedula.trim() &&
      celular.length > 4 &&
      values.empresa &&
      this.servicios().length > 0 &&
      (!needsTi || this.serviciosTi().length > 0)
    );

  });

  constructor() {

    this.form.valueChanges.subscribe(() => {
      this.formSnapshot.set(this.form.getRawValue());
    });

    effect(() => {

      if (!this.visible()) {
        return;
      }

      this.reset();

    });

  }

  close(): void {

    this.closed.emit();

  }

  save(): void {

    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const record: StandbyPersonRecord = {
      id: Date.now(),
      funcionario: values.funcionario.trim(),
      cedula: values.cedula.trim(),
      celular: values.celular.trim(),
      empresa: values.empresa,
      servicios: [...this.servicios()],
      serviciosTi: [...this.serviciosTi()],
      funcion: values.funcion.trim(),
      observaciones: values.observaciones.trim()
    };

    this.saved.emit(record);
    this.reset();
    this.close();

    this.saveSuccess.show({
      title: '¡Listo!',
      message: 'La persona quedó registrada en standby.'
    });

  }

  private reset(): void {

    this.form.reset({
      funcionario: '',
      cedula: '',
      celular: '+57',
      empresa: '',
      funcion: '',
      observaciones: ''
    });

    this.servicios.set([]);
    this.serviciosTi.set([]);
    this.formSnapshot.set(this.form.getRawValue());

  }

}
