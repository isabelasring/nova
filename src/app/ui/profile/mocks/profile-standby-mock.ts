import { StandbyAssignment }
from '../../stanby/models/standby-assignment.model';

function monthRange(
  startDay: number,
  durationDays = 7,
  monthOffset = 0
): { fechaInicio: Date; fechaFin: Date } {

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;

  const fechaInicio = new Date(year, month, startDay);
  const fechaFin = new Date(fechaInicio);

  fechaFin.setDate(fechaFin.getDate() + durationDays - 1);

  return { fechaInicio, fechaFin };

}

/** Standby del perfil actual (Ana Morales), anclados al mes de hoy. */
export const PERFIL_STANDBY_MOCK: StandbyAssignment[] = [
  {
    id: 9005,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...monthRange(15, 7, -3),
    color: '#9ca3af',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 9004,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...monthRange(12, 7, -2),
    color: '#9ca3af',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113002',
        nombreAplicacion: 'Portal Transaccional'
      }
    ]
  },
  {
    id: 9001,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...monthRange(7),
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
    id: 9002,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...monthRange(21),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 9003,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...monthRange(4, 7, 1),
    color: '#59cbeb',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113003',
        nombreAplicacion: 'App Personas'
      }
    ]
  },
  {
    id: 9006,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...monthRange(18, 7, 1),
    color: '#59cbeb',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  }
];
