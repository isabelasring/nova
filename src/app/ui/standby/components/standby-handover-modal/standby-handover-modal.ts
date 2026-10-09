import {
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

import { CURRENT_USER }
from '../../../profile/mocks/current-user-mock';

import {
  STANDBY_DELEGATION_REASONS,
  STANDBY_LEADER_PEERS
} from '../../mocks/standby-leaders-mock';

import {
  StandbyDelegationReason,
  StandbyLeaderPeer
} from '../../models/standby-delegation-model';

import { StandbyDelegationService }
from '../../services/standby-delegation-service';

import { SaveSuccessService }
from '../../../shared/services/save-success-service';

import { DateFieldComponent }
from '../../../shared/components/date-field/date-field';

import { SearchFieldComponent }
from '../../../shared/components/search-field/search-field';

import { OptionSelectComponent }
from '../../../shared/components/option-select/option-select';

import { avatarToneForName }
from '../../../shared/utils/avatar-tone-utils';

@Component({
  selector: 'app-standby-handover-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DateFieldComponent,
    SearchFieldComponent,
    OptionSelectComponent
  ],
  templateUrl: './standby-handover-modal.html',
  styleUrl: './standby-handover-modal.scss'
})
export class StandbyHandoverModalComponent {

  private readonly fb = inject(FormBuilder);

  private readonly delegationService =
    inject(StandbyDelegationService);

  private readonly saveSuccess =
    inject(SaveSuccessService);

  readonly visible = input(false);

  readonly closed = output<void>();

  readonly delegated = output<void>();

  readonly owner = CURRENT_USER;

  readonly reasons = STANDBY_DELEGATION_REASONS;

  readonly motivoOptions = this.reasons.map(reason => ({
    value: reason.id,
    label: reason.label
  }));

  readonly maxUsers = 3;

  readonly allUsers = STANDBY_LEADER_PEERS.filter(
    user => user.nombre !== CURRENT_USER.nombre
  );

  readonly userSearch = signal('');

  readonly selectedUsers = signal<StandbyLeaderPeer[]>([]);

  readonly motivoIsOther = signal(false);

  readonly form = this.fb.nonNullable.group({
    motivo: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    nota: ['']
  });

  readonly hasUserSearch = computed(
    () => this.userSearch().trim().length > 0
  );

  readonly filteredUsers = computed(() => {

    const term = this.userSearch().trim().toLowerCase();
    const chosen = new Set(this.selectedUsers().map(user => user.id));

    if (!term) {
      return [];
    }

    return this.allUsers.filter(user =>
      !chosen.has(user.id) && (
        user.nombre.toLowerCase().includes(term) ||
        user.evc.toLowerCase().includes(term) ||
        user.linea.toLowerCase().includes(term)
      )
    );

  });

  constructor() {

    effect(() => {

      if (this.visible()) {
        this.reset();
      }

    });

  }

  get canSave(): boolean {

    const values = this.form.getRawValue();
    const users = this.selectedUsers();
    const noteOk =
      !this.motivoIsOther() ||
      values.nota.trim().length >= 10;

    return Boolean(
      values.motivo &&
      users.length > 0 &&
      users.length <= this.maxUsers &&
      values.fechaInicio &&
      values.fechaFin &&
      values.fechaFin >= values.fechaInicio &&
      noteOk
    );

  }

  close(): void {

    this.reset();
    this.closed.emit();

  }

  avatarTone(name: string) {
    return avatarToneForName(name);
  }

  onMotivoChange(value: string): void {

    this.motivoIsOther.set(value === 'otro');
    this.syncNotaValidators(value === 'otro');

  }

  onUserSearch(value: string): void {

    this.userSearch.set(value);

  }

  selectUser(user: StandbyLeaderPeer): void {

    if (this.selectedUsers().length >= this.maxUsers) {
      return;
    }

    this.selectedUsers.update(list => [...list, user]);
    this.userSearch.set('');

  }

  removeUser(id: number): void {

    this.selectedUsers.update(list =>
      list.filter(user => user.id !== id)
    );

  }

  save(): void {

    this.syncNotaValidators(this.motivoIsOther());

    if (!this.canSave) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const users = this.selectedUsers();

    if (users.length === 0) {
      return;
    }

    const names = users.map(user => user.nombre);

    this.delegationService.delegate({
      toUsers: names,
      motivo: values.motivo as StandbyDelegationReason,
      nota: values.nota.trim(),
      fechaInicio: new Date(values.fechaInicio + 'T00:00:00'),
      fechaFin: new Date(values.fechaFin + 'T00:00:00')
    });

    this.delegated.emit();
    this.close();

    const listed = names.length === 1
      ? names[0]
      : names.length === 2
        ? `${names[0]} y ${names[1]}`
        : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;

    this.saveSuccess.show({
      title: 'Relevo registrado',
      message: names.length === 1
        ? `${listed} podrá programar standby por ti.`
        : `${listed} podrán programar standby por ti.`
    });

  }

  private reset(): void {

    this.form.reset({
      motivo: '',
      fechaInicio: '',
      fechaFin: '',
      nota: ''
    });

    this.userSearch.set('');
    this.selectedUsers.set([]);
    this.motivoIsOther.set(false);
    this.syncNotaValidators(false);

  }

  private syncNotaValidators(required: boolean): void {

    const notaControl = this.form.controls.nota;

    if (required) {
      notaControl.setValidators([
        Validators.required,
        Validators.minLength(10)
      ]);
    } else {
      notaControl.clearValidators();
    }

    notaControl.updateValueAndValidity({
      emitEvent: false
    });

  }

}
