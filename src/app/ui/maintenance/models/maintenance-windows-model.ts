export type MaintenanceWindowType =
  | 'Ventana programada'
  | 'Promesa de servicio';

export interface MaintenanceWindow {
  id: number;
  aplicacion: string;
  nombreAplicacion: string;
  bvc: string;
  ldc: string;
  celula: string;
  service: string;
  /** @deprecated Preferir `celula`. */
  evc: string;
  /** @deprecated Preferir `ldc`. */
  linea: string;
  frecuencia: string;
  fechaInicio: string;
  fechaFin: string;
  zonaHoraria: string;
  estado: string;
  impacto: string;
  observacion: string;
  tipo: MaintenanceWindowType;
  crq?: string;
}

export type TipoVentanaForm = '' | 'programada' | 'promesa';