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

  readonly allLeaders = STANDBY_LEADER_PEERS.filter(
    leader => leader.nombre !== CURRENT_USER.nombre
  );

  readonly leaderSearch = signal('');

  readonly selectedLeader = signal<StandbyLeaderPeer | null>(null);

  readonly motivoIsOther = signal(false);

  readonly form = this.fb.nonNullable.group({
    motivo: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    nota: ['']
  });

  readonly hasLeaderSearch = computed(
    () => this.leaderSearch().trim().length > 0
  );

  readonly filteredLeaders = computed(() => {

    const term = this.leaderSearch().trim().toLowerCase();

    if (!term) {
      return [];
    }

    return this.allLeaders.filter(leader =>
      leader.nombre.toLowerCase().includes(term) ||
      leader.evc.toLowerCase().includes(term) ||
      leader.linea.toLowerCase().includes(term)
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
    const leader = this.selectedLeader();
    const noteOk =
      !this.motivoIsOther() ||
      values.nota.trim().length >= 10;

    return Boolean(
      values.motivo &&
      leader &&
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

  onLeaderSearch(value: string): void {

    this.leaderSearch.set(value);

  }

  selectLeader(leader: StandbyLeaderPeer): void {

    this.selectedLeader.set(leader);
    this.leaderSearch.set('');

  }

  clearLeaderSelection(): void {

    this.selectedLeader.set(null);
    this.leaderSearch.set('');

  }

  save(): void {

    this.syncNotaValidators(this.motivoIsOther());

    if (!this.canSave) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const leader = this.selectedLeader();

    if (!leader) {
      return;
    }

    this.delegationService.delegate({
      toLeader: leader.nombre,
      motivo: values.motivo as StandbyDelegationReason,
      nota: values.nota.trim(),
      fechaInicio: new Date(values.fechaInicio + 'T00:00:00'),
      fechaFin: new Date(values.fechaFin + 'T00:00:00')
    });

    this.delegated.emit();
    this.close();

    this.saveSuccess.show({
      title: 'Relevo registrado',
      message:
        `${leader.nombre} podrá programar standby por ti. Sigues siendo la líder titular.`
    });

  }

  private reset(): void {

    this.form.reset({
      motivo: '',
      fechaInicio: '',
      fechaFin: '',
      nota: ''
    });

    this.leaderSearch.set('');
    this.selectedLeader.set(null);
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
