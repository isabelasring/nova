export type StandbyDelegationReason =
  | 'vacaciones'
  | 'licencia'
  | 'rotacion'
  | 'proyecto'
  | 'otro';

export interface StandbyDelegation {
  id: number;
  fromLeader: string;
  toLeader: string;
  motivo: StandbyDelegationReason;
  nota: string;
  fechaInicio: Date;
  fechaFin: Date;
  createdAt: Date;
}

export interface StandbyLeaderPeer {
  id: number;
  nombre: string;
  evc: string;
  linea: string;
  equipo: number;
  initials: string;
}