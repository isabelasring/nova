/** Dimensiones de organización del portal. */
export type PortalOrgDimension = 'bvc' | 'ldc' | 'celula';

/** Dimensiones de catálogo / entidad. */
export type PortalEntityDimension =
  | 'service'
  | 'app'
  | 'user';

export type PortalFilterDimension =
  | PortalOrgDimension
  | PortalEntityDimension;

export interface PortalFilterState {
  bvc: string;
  ldc: string;
  celula: string;
  service: string;
  app: string;
  user: string;
}

export const EMPTY_PORTAL_FILTER: PortalFilterState = {
  bvc: '',
  ldc: '',
  celula: '',
  service: '',
  app: '',
  user: ''
};

export const PORTAL_ORG_DIMENSIONS: PortalOrgDimension[] = [
  'bvc',
  'ldc',
  'celula'
];

export const PORTAL_ENTITY_DIMENSIONS: PortalEntityDimension[] = [
  'service',
  'app',
  'user'
];

export const PORTAL_FILTER_LABELS: Record<
  PortalFilterDimension,
  string
> = {
  bvc: 'EVC',
  ldc: 'LC',
  celula: 'Célula',
  service: 'Service',
  app: 'App',
  user: 'User'
};

/** Catálogo mock de valores organizacionales (EVC). */
export const PORTAL_EVC_OPTIONS = [
  'Banca Personas',
  'Banca Empresas',
  'Tesorería',
  'Canales Digitales',
  'Operaciones'
] as const;

/** @deprecated Usar PORTAL_EVC_OPTIONS */
export const PORTAL_BVC_OPTIONS = PORTAL_EVC_OPTIONS;

/** Catálogo mock de valores organizacionales (LC). */
export const PORTAL_LC_OPTIONS = [
  'Aplicaciones',
  'Infraestructura',
  'Monitoreo',
  'Backoffice',
  'Cumplimiento'
] as const;

/** @deprecated Usar PORTAL_LC_OPTIONS */
export const PORTAL_LDC_OPTIONS = PORTAL_LC_OPTIONS;

export const PORTAL_CELULA_OPTIONS = [
  'Célula Core',
  'Célula Digital',
  'Célula Canales',
  'Célula Operaciones',
  'Célula Finanzas',
  'Célula Riesgos',
  'Célula Empresas',
  'Célula Integración',
  'Célula Comercial',
  'Célula Productos'
] as const;

export const PORTAL_SERVICE_OPTIONS = [
  'Transaccional',
  'Pagos',
  'Créditos',
  'Onboarding',
  'Reportería',
  'Integración',
  'Monitoreo',
  'CRM'
] as const;

/** Entidad filtrable por el portal. */
export interface PortalFilterable {
  bvc?: string;
  ldc?: string;
  celula?: string;
  service?: string;
  codigoAplicacion?: string;
  nombreAplicacion?: string;
  responsable?: string;
  nombre?: string;
}
