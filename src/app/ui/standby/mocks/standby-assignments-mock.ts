import { StandbyAssignment }
from '../models/standby-assignment-model';

import { standbyWeekNearDay }
from '../utils/standby-week-util';

function week(
  preferredDay: number,
  monthOffset = 0
): { fechaInicio: Date; fechaFin: Date } {
  return standbyWeekNearDay(preferredDay, monthOffset);
}

/** Asignaciones mock: viernes 12:00 → viernes siguiente 12:00. */
export const STANDBY_ASSIGNMENTS_MOCK: StandbyAssignment[] = [
  {
    id: 1001,
    responsable: 'Daniel Lopez Montes',
    celular: '+57 310 539 0611',
    ...week(12),
    color: '#9063cd',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 1002,
    responsable: 'Bibiana Montoya',
    celular: '+57 310 987 6543',
    ...week(19),
    color: '#f586cd',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 1003,
    responsable: 'Dylan Martinez',
    celular: '+57 320 111 2233',
    ...week(5),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113002',
        nombreAplicacion: 'Portal Transaccional'
      }
    ]
  },
  // Ana Morales (perfil actual): pasados / mes actual / próximo
  {
    id: 1004,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...week(15, -3),
    color: '#59cbeb',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 1006,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...week(12, -2),
    color: '#f586cd',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113002',
        nombreAplicacion: 'Portal Transaccional'
      }
    ]
  },
  {
    id: 1007,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...week(11),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      },
      {
        codigoAplicacion: 'NU0113002',
        nombreAplicacion: 'Portal Transaccional'
      }
    ]
  },
  {
    id: 1008,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...week(18),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 1009,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...week(4, 1),
    color: '#59cbeb',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113003',
        nombreAplicacion: 'App Personas'
      }
    ]
  },
  {
    id: 1010,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...week(18, 1),
    color: '#59cbeb',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 1011,
    responsable: 'Mariana Soto',
    celular: '+57 300 111 2233',
    ...week(11),
    color: '#9063cd',
    aplicaciones: [
      {
        codigoAplicacion: 'SRV-001',
        nombreAplicacion: 'Reportería'
      }
    ]
  },
  {
    id: 1012,
    responsable: 'Paula Andrea Giraldo',
    celular: '+57 301 222 3344',
    ...week(18),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'SRV-003',
        nombreAplicacion: 'Transaccional'
      }
    ]
  },
  {
    id: 1013,
    responsable: 'Carlos Eduardo Vargas',
    celular: '+57 302 333 4455',
    ...week(4, 1),
    color: '#ff7f41',
    aplicaciones: [
      {
        codigoAplicacion: 'SRV-004',
        nombreAplicacion: 'Pagos'
      }
    ]
  }
];
