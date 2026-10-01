export interface StandbyApplication {

  id: number;

  codigoAplicacion: string;

  nombreAplicacion: string;

  descripcion: string;

  /** Vertical de negocio (BVC). */
  bvc: string;

  /** Línea de conocimiento (LdC). */
  ldc: string;

  /** Célula responsable. */
  celula: string;

  /** Servicio de TI asociado. */
  service: string;

  /**
   * Alias legado de célula (compatibilidad UI).
   * @deprecated Preferir `celula`.
   */
  evc: string;

  /**
   * Alias legado de LdC (compatibilidad UI).
   * @deprecated Preferir `ldc`.
   */
  linea: string;

  responsable: string;

  selected: boolean;

  programmed?: boolean;

}