export interface StandbyPolicySection {
  id: string;
  number: string;
  title: string;
  summary: string;
  bullets: string[];
  highlight?: string;
}

export interface StandbyPolicyMeta {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  owner: string;
}

export const STANDBY_POLICY_META: StandbyPolicyMeta = {
  title: 'Políticas de Standby',
  subtitle:
    'Lineamientos corporativos para la programación, cobertura y escalamiento de standby en aplicaciones críticas.',
  version: 'v2.1',
  lastUpdated: 'Agosto 2026',
  owner: 'Operaciones · Continuidad de servicio'
};

export const STANDBY_POLICY_SECTIONS: StandbyPolicySection[] = [
  {
    id: 'alcance',
    number: '01',
    title: 'Alcance y objetivo',
    summary:
      'El standby garantiza respuesta oportuna ante incidentes en aplicaciones de misión crítica fuera del horario laboral habitual.',
    bullets: [
      'Aplica a aplicaciones registradas en el portal con contacto y responsable vigente.',
      'Su objetivo es mantener continuidad operativa y tiempos de respuesta acordes al nivel de criticidad.',
      'Toda programación debe quedar trazada en el módulo Standby del portal unificado.'
    ],
    highlight:
      'Ninguna cobertura fuera del portal se considera válida para auditoría.'
  },
  {
    id: 'cobertura',
    number: '02',
    title: 'Ventana de cobertura',
    summary:
      'Cada turno de standby cubre un periodo continuo de siete días calendario.',
    bullets: [
      'El inicio del turno es siempre un viernes.',
      'El cierre del turno es el jueves siguiente (viernes → jueves).',
      'Un mismo responsable puede programar varios turnos, siempre que no se crucen con otros ya aceptados.',
      'Los días ocupados por otro responsable no están disponibles para selección.'
    ],
    highlight: 'Regla operativa: selecciona únicamente el viernes de inicio; el sistema completa la semana.'
  },
  {
    id: 'responsables',
    number: '03',
    title: 'Responsables y elegibilidad',
    summary:
      'Solo personal autorizado y registrado como contacto de la aplicación puede ser asignado.',
    bullets: [
      'El responsable debe tener celular corporativo activo y correo de notificación válido.',
      'Debe conocer runbooks, accesos y procedimientos de escalamiento de la aplicación.',
      'Es responsable de permanecer localizable durante las 24 horas de cada día del turno.',
      'Ante incapacidad, debe gestionar relevo con anticipación y actualizar la programación.'
    ]
  },
  {
    id: 'programacion',
    number: '04',
    title: 'Programación en el portal',
    summary:
      'La programación se realiza desde Standby → Agregar, siguiendo el flujo guiado del calendario.',
    bullets: [
      'Selecciona una o más aplicaciones disponibles y agrégalas al panel de programación.',
      'Elige el responsable y los viernes de inicio deseados en el calendario.',
      'Revisa el resumen (de viernes a jueves) y confirma con «Aceptar selección».',
      'Finaliza con «Guardar» para publicar el standby programado.'
    ]
  },
  {
    id: 'escalamiento',
    number: '05',
    title: 'Escalamiento y tiempos de respuesta',
    summary:
      'Ante un incidente, el responsable de standby es el primer punto de contacto operativo.',
    bullets: [
      'Atender alertas en el tiempo definido por la criticidad de la aplicación (SLA interno).',
      'Escalar al líder de servicio o EVC cuando el incidente supere su alcance técnico.',
      'Documentar acciones en la herramienta de gestión de incidentes correspondiente.',
      'Notificar continuidad si hay impacto a clientes o transacciones masivas.'
    ],
    highlight:
      'En ausencia de respuesta en 15 minutos, aplica el escalamiento automático del runbook.'
  },
  {
    id: 'cumplimiento',
    number: '06',
    title: 'Cumplimiento y auditoría',
    summary:
      'El cumplimiento de estas políticas es obligatorio para equipos de aplicaciones y EVC.',
    bullets: [
      'Turnos sin responsable confirmado serán rechazados en revisiones de continuidad.',
      'Modificaciones posteriores deben reflejarse en el portal antes del inicio del turno.',
      'Incumplimientos reiterados se reportan al comité de operaciones para seguimiento.',
      'Esta versión reemplaza lineamientos informales previos sobre selección libre de fechas.'
    ]
  }
];

export const STANDBY_POLICY_PRINCIPLES = [
  {
    icon: 'calendar',
    label: '7 días',
    detail: 'Cobertura continua por turno'
  },
  {
    icon: 'week',
    label: 'Vie → Jue',
    detail: 'Inicio siempre en viernes'
  },
  {
    icon: 'shield',
    label: 'Trazabilidad',
    detail: 'Todo queda en el portal'
  },
  {
    icon: 'alert',
    label: 'Escalamiento',
    detail: 'Runbook y SLA interno'
  }
];
