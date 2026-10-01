export interface Contacto {
  id: number;
  codigoAplicacion: string;
  nombreAplicacion: string;
  celular: string;
  nombre: string;
  correo: string;
  horario: string;
  bvc: string;
  ldc: string;
  celula: string;
  service: string;
  /** @deprecated Preferir `celula`. */
  evc: string;
  /** @deprecated Preferir `ldc`. */
  linea: string;
}
