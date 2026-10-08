export interface StandbyAssociatedApp {
  codigoAplicacion: string;
  nombreAplicacion: string;
}

export interface StandbyAssignment {
  id: number;
  responsable: string;
  celular: string;
  fechaInicio: Date;
  fechaFin: Date;
  color: string;
  aplicaciones?: StandbyAssociatedApp[];
  /** 1 = llamar primero, solo si se pidió prioridad de llamada. */
  prioridad?: number;
  /** Este standby usa orden de llamada entre sus personas. */
  quierePrioridad?: boolean;
  observacion?: string;
}
