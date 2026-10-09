import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import { CURRENT_USER }
from '../../profile/mocks/current-user-mock';

import {
  StandbyDelegation,
  StandbyDelegationReason
} from '../models/standby-delegation-model';

const STORAGE_KEY = 'portal-standby-delegations';

@Injectable({
  providedIn: 'root'
})
export class StandbyDelegationService {

  /** Líder titular: no se elimina; solo delega programación. */
  readonly ownerLeader = CURRENT_USER.nombre;

  private readonly delegationsSource =
    signal<StandbyDelegation[]>(this.readStorage());

  readonly delegations =
    this.delegationsSource.asReadonly();

  readonly activeOutgoing = computed(() =>
    this.delegationsSource().find(item =>
      item.fromLeader === this.ownerLeader &&
      this.isActiveToday(item)
    ) ?? null
  );

  readonly activeIncoming = computed(() =>
    this.delegationsSource().find(item =>
      this.receiverNames(item).includes(this.ownerLeader) &&
      this.isActiveToday(item)
    ) ?? null
  );

  /** Titular sigue siendo líder; otro programa por ti. */
  readonly hasDelegatedOut = computed(() =>
    this.activeOutgoing() !== null
  );

  readonly isActingForAnotherLeader = computed(() =>
    this.activeIncoming() !== null
  );

  readonly programmingContextLabel = computed(() => {

    const incoming = this.activeIncoming();
    const outgoing = this.activeOutgoing();

    if (incoming) {
      return `Programas en nombre de ${incoming.fromLeader}`;
    }

    if (outgoing) {
      const verb = this.receiverNames(outgoing).length === 1
        ? 'programa'
        : 'programan';

      return `${this.namesOf(outgoing)} ${verb} por ti`;
    }

    return 'Programación a tu cargo';

  });

  namesOf(item: StandbyDelegation): string {

    const names = this.receiverNames(item);

    if (names.length <= 1) {
      return names[0] ?? '';
    }

    if (names.length === 2) {
      return `${names[0]} y ${names[1]}`;
    }

    return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;

  }

  receiverCount(item: StandbyDelegation): number {

    return this.receiverNames(item).length;

  }

  delegate(payload: {
    toUsers: string[];
    motivo: StandbyDelegationReason;
    nota: string;
    fechaInicio: Date;
    fechaFin: Date;
  }): StandbyDelegation {

    const toUsers = payload.toUsers.slice(0, 3);

    const created: StandbyDelegation = {
      id: Date.now(),
      fromLeader: this.ownerLeader,
      toLeader: toUsers[0] ?? '',
      toUsers,
      motivo: payload.motivo,
      nota: payload.nota.trim(),
      fechaInicio: payload.fechaInicio,
      fechaFin: payload.fechaFin,
      createdAt: new Date()
    };

    const withoutOutgoing =
      this.delegationsSource().filter(
        item => item.fromLeader !== this.ownerLeader
      );

    this.delegationsSource.set([
      created,
      ...withoutOutgoing
    ]);

    this.persist();

    return created;

  }

  revokeOutgoing(): void {

    this.delegationsSource.update(list =>
      list.filter(
        item =>
          !(
            item.fromLeader === this.ownerLeader &&
            this.isActiveToday(item)
          )
      )
    );

    this.persist();

  }

  reasonLabel(
    motivo: StandbyDelegationReason
  ): string {

    const labels: Record<StandbyDelegationReason, string> = {
      vacaciones: 'Vacaciones',
      licencia: 'Licencia',
      rotacion: 'Rotación',
      proyecto: 'Proyecto especial',
      otro: 'Otro motivo'
    };

    return labels[motivo];

  }

  private receiverNames(item: StandbyDelegation): string[] {

    if (item.toUsers?.length) {
      return item.toUsers;
    }

    return item.toLeader ? [item.toLeader] : [];

  }

  private isActiveToday(
    delegation: StandbyDelegation
  ): boolean {

    const today = this.startOfDay(new Date());
    const from = this.startOfDay(delegation.fechaInicio);
    const to = this.startOfDay(delegation.fechaFin);

    return today >= from && today <= to;

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

  private readStorage(): StandbyDelegation[] {

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as Array<
        Omit<StandbyDelegation, 'fechaInicio' | 'fechaFin' | 'createdAt'> & {
          fechaInicio: string;
          fechaFin: string;
          createdAt: string;
        }
      >;

      return parsed.map(item => ({
        ...item,
        toUsers: item.toUsers?.length
          ? item.toUsers.slice(0, 3)
          : (item.toLeader ? [item.toLeader] : []),
        fechaInicio: new Date(item.fechaInicio),
        fechaFin: new Date(item.fechaFin),
        createdAt: new Date(item.createdAt)
      }));

    } catch {
      return [];
    }

  }

  private persist(): void {

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.delegationsSource())
      );
    } catch {
      // ignore storage errors
    }

  }

}