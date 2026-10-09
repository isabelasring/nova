import {
  StandbyDelegationReason,
  StandbyLeaderPeer
} from '../models/standby-delegation-model';

/** Líderes disponibles para recibir el relevo (demo, sin roles aún). */
export const STANDBY_LEADER_PEERS: StandbyLeaderPeer[] = [
  {
    id: 1,
    nombre: 'Daniel Lopez Montes',
    evc: 'EVC Core Bancario',
    linea: 'Aplicaciones',
    equipo: 5,
    initials: 'DL'
  },
  {
    id: 2,
    nombre: 'Bibiana Montoya',
    evc: 'EVC Digital',
    linea: 'Aplicaciones',
    equipo: 4,
    initials: 'BM'
  },
  {
    id: 3,
    nombre: 'Jahiver Horacio Lopez',
    evc: 'EVC Operaciones',
    linea: 'Monitoreo',
    equipo: 6,
    initials: 'JH'
  },
  {
    id: 4,
    nombre: 'Miguel Ángel García',
    evc: 'EVC Canales',
    linea: 'Aplicaciones',
    equipo: 3,
    initials: 'MG'
  },
  {
    id: 5,
    nombre: 'Carlos Restrepo',
    evc: 'EVC Comercial',
    linea: 'Aplicaciones',
    equipo: 4,
    initials: 'CR'
  }
];

export const STANDBY_DELEGATION_REASONS: {
  id: StandbyDelegationReason;
  label: string;
  emoji: string;
  hint: string;
}[] = [
  {
    id: 'vacaciones',
    label: 'Vacaciones',
    emoji: '🏖️',
    hint: 'Te ausentas y otro usuario cubre la programación'
  },
  {
    id: 'licencia',
    label: 'Licencia',
    emoji: '📋',
    hint: 'Ausencia planificada con respaldo operativo'
  },
  {
    id: 'rotacion',
    label: 'Rotación',
    emoji: '🔄',
    hint: 'Reparto temporal de carga entre usuarios'
  },
  {
    id: 'proyecto',
    label: 'Proyecto especial',
    emoji: '🎯',
    hint: 'Foco en otra iniciativa; el equipo sigue cubierto'
  },
  {
    id: 'otro',
    label: 'Otro motivo',
    emoji: '✉️',
    hint: 'Describe el contexto en una nota breve'
  }
];