export type AlertaSeveridad = 'High' | 'Medium' | 'Low' | 'Information';
export type AlertaEstado = 'PROBLEM' | 'RESOLVED';
export type AlertaVista = AlertaEstado | 'ASIGNADAS' | 'MIAS';
export type AlertaPlataforma =
  | 'dynatrace'
  | 'cloudwatch'
  | 'aiops_cloudwatch'
  | 'desarrollos';

export interface AlertaTag {
  key: string;
  value: string;
}

/** Comentario gestionado por usuarios CGM. */
export interface AlertaComentario {
  id: string;
  autor: string;
  rol: 'CGM' | 'Sistema' | 'Admin';
  fechaHora: string;
  texto: string;
}

export interface AlertaAplicacion {
  codigo: string;
  nombre: string;
}

/** Paso de lo que va ocurriendo con la alerta. */
export interface AlertaTraza {
  id: string;
  fechaHora: string;
  usuario: string;
  mensaje: string;
}

export interface AlertaAsignacion {
  cgm: string;
  correo: string;
  fechaHora: string;
}

export interface AlertaDetalle {
  plataforma: string;
  nombreAlarma: string;
  cuentaAws: string;
  fechaPlataforma: string;
  idExterno: string;
  url?: string;
  entidad: string;
  aplicacion: string;
  codigoApp: string;
  onSchedule: boolean;
  standby?: string;
  telefono?: string;
  correo?: string;
  teams?: string;
  serviciosImpactados: string;
  sla: string;
  analistaConfiabilidad?: string;
  grupoSoporte?: string;
  entregadoCgm: boolean;
  bia: boolean;
  sox: boolean;
  roti: boolean;
}

export interface Alerta {
  id: string;
  hora: string;
  fechaHora: string;
  severidad: AlertaSeveridad;
  horaRecuperacion?: string;
  estado: AlertaEstado;
  host: AlertaPlataforma | string;
  problema: string;
  descripcion?: string;
  duracion: string;
  /** Contador derivado de comentariosCgm.length */
  comentarios: number;
  comentariosCgm: AlertaComentario[];
  tags: AlertaTag[];
  detalle: AlertaDetalle;
  aplicacionesAfectadas?: AlertaAplicacion[];
  trazas?: AlertaTraza[];
  asignacion?: AlertaAsignacion | null;
}
