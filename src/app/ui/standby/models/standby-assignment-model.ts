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
}
