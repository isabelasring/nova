import { MaintenanceWindow }
from '../models/maintenance-window.model';

import { STANDBY_APPLICATIONS }
from '../../stanby/mocks/standby-applications.mock';

function fromApp(codigo: string) {

  const app = STANDBY_APPLICATIONS.find(
    item => item.codigoAplicacion === codigo
  );

  return {
    bvc: app?.bvc ?? '',
    ldc: app?.ldc ?? '',
    celula: app?.celula ?? '',
    service: app?.service ?? '',
    evc: app?.celula ?? '',
    linea: app?.ldc ?? '',
    nombreAplicacion: app?.nombreAplicacion ?? ''
  };

}

export const MAINTENANCE_WINDOWS_MOCK: MaintenanceWindow[] = [
  {
    id: 1,
    aplicacion: 'NU0113001',
    ...fromApp('NU0113001'),
    frecuencia: 'Semanal',
    fechaInicio: '20/08/2026 22:00',
    fechaFin: '21/08/2026 02:00',
    zonaHoraria: 'América / Bogotá',
    estado: 'Programada',
    impacto: 'Servicio degradado durante la ventana',
    observacion: 'Reinicio coordinado con operaciones',
    tipo: 'Ventana programada'
  },
  {
    id: 2,
    aplicacion: 'NU0113002',
    ...fromApp('NU0113002'),
    frecuencia: 'Mensual',
    fechaInicio: '05/09/2026 23:00',
    fechaFin: '06/09/2026 03:00',
    zonaHoraria: 'América / Bogotá',
    estado: 'Programada',
    impacto: 'Canales digitales no disponibles',
    observacion: 'Notificar a canales 24h antes',
    tipo: 'Ventana programada'
  },
  {
    id: 3,
    aplicacion: 'NU0113003',
    ...fromApp('NU0113003'),
    frecuencia: 'Una vez',
    fechaInicio: '12/09/2026 01:00',
    fechaFin: '12/09/2026 05:00',
    zonaHoraria: 'América / Bogotá',
    estado: 'Programada',
    impacto: 'App móvil en modo lectura',
    observacion: '',
    tipo: 'Ventana programada'
  },
  {
    id: 4,
    aplicacion: 'NU0113004',
    ...fromApp('NU0113004'),
    frecuencia: 'Semanal',
    fechaInicio: '18/09/2026 22:00',
    fechaFin: '19/09/2026 01:00',
    zonaHoraria: 'América / Bogotá',
    estado: 'En ejecución',
    impacto: 'Alertas con demora temporal',
    observacion: 'Ventana en curso',
    tipo: 'Ventana programada'
  },
  {
    id: 5,
    aplicacion: 'NU0113005',
    ...fromApp('NU0113005'),
    frecuencia: 'Diaria',
    fechaInicio: '21/08/2026 00:00',
    fechaFin: '21/08/2026 02:00',
    zonaHoraria: 'América / Bogotá',
    estado: 'Finalizada',
    impacto: 'Pagos diferidos al finalizar',
    observacion: 'Cerrada sin incidentes',
    tipo: 'Promesa de servicio',
    crq: 'CRQ-10890'
  },
  {
    id: 6,
    aplicacion: 'NU0113001',
    ...fromApp('NU0113001'),
    frecuencia: 'Mensual',
    fechaInicio: '01/10/2026 21:00',
    fechaFin: '02/10/2026 01:00',
    zonaHoraria: 'América / Bogotá',
    estado: 'Programada',
    impacto: 'Actualización de núcleo',
    observacion: 'Pendiente validación de cab',
    tipo: 'Ventana programada'
  },
  {
    id: 7,
    aplicacion: 'NU0113006',
    ...fromApp('NU0113006'),
    frecuencia: 'Una vez',
    fechaInicio: '28/09/2026 20:00',
    fechaFin: '28/09/2026 23:00',
    zonaHoraria: 'América / Bogotá',
    estado: 'Programada',
    impacto: 'Originación de créditos no disponible',
    observacion: 'Coordinado con mesa de ayuda',
    tipo: 'Promesa de servicio',
    crq: 'CRQ-11567'
  }
];
