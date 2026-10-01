import { StandbyApplication }
from '../models/standby-application-model';

/**
 * Unidades programables para Standby de otras áreas (sin apps TI).
 * Reutiliza el modelo StandbyApplication: el "código" es interno (SRV-xxx)
 * y el nombre visible es el servicio.
 */
export const STANDBY_AREA_SERVICES: StandbyApplication[] = [
  {
    id: 13,
    codigoAplicacion: 'SRV-001',
    nombreAplicacion: 'Reportería',
    descripcion:
      'Elaboración, validación y envío de reportes de riesgo y cumplimiento para comités y entes de control.',
    bvc: 'Operaciones',
    ldc: 'Cumplimiento',
    celula: 'Célula Riesgos',
    service: 'Reportería',
    evc: 'Célula Riesgos',
    linea: 'Cumplimiento',
    responsable: 'Mariana Soto',
    selected: false
  },
  {
    id: 14,
    codigoAplicacion: 'SRV-002',
    nombreAplicacion: 'Monitoreo',
    descripcion:
      'Vigilancia de operaciones inusuales, alertas SARLAFT y seguimiento de casos de cumplimiento.',
    bvc: 'Operaciones',
    ldc: 'Cumplimiento',
    celula: 'Célula Riesgos',
    service: 'Monitoreo',
    evc: 'Célula Riesgos',
    linea: 'Cumplimiento',
    responsable: 'Camilo Andrés Ríos',
    selected: false
  },
  {
    id: 15,
    codigoAplicacion: 'SRV-003',
    nombreAplicacion: 'Transaccional',
    descripcion:
      'Procesamiento, conciliación y regularización de operaciones de backoffice en ventanas extendidas.',
    bvc: 'Operaciones',
    ldc: 'Backoffice',
    celula: 'Célula Operaciones',
    service: 'Transaccional',
    evc: 'Célula Operaciones',
    linea: 'Backoffice',
    responsable: 'Paula Andrea Giraldo',
    selected: false
  },
  {
    id: 16,
    codigoAplicacion: 'SRV-004',
    nombreAplicacion: 'Pagos',
    descripcion:
      'Autorización de pagos masivos, transferencias interbancarias y gestión de liquidez.',
    bvc: 'Tesorería',
    ldc: 'Backoffice',
    celula: 'Célula Finanzas',
    service: 'Pagos',
    evc: 'Célula Finanzas',
    linea: 'Backoffice',
    responsable: 'Carlos Eduardo Vargas',
    selected: false
  },
  {
    id: 17,
    codigoAplicacion: 'SRV-005',
    nombreAplicacion: 'Onboarding',
    descripcion:
      'Vinculación y habilitación de clientes corporativos, validación documental y activación de productos.',
    bvc: 'Banca Empresas',
    ldc: 'Backoffice',
    celula: 'Célula Empresas',
    service: 'Onboarding',
    evc: 'Célula Empresas',
    linea: 'Backoffice',
    responsable: 'Andrés Felipe Mejía',
    selected: false
  },
  {
    id: 18,
    codigoAplicacion: 'SRV-006',
    nombreAplicacion: 'CRM',
    descripcion:
      'Atención y gestión comercial de cartera empresarial, escalamiento y continuidad de relación.',
    bvc: 'Banca Empresas',
    ldc: 'Backoffice',
    celula: 'Célula Comercial',
    service: 'CRM',
    evc: 'Célula Comercial',
    linea: 'Backoffice',
    responsable: 'Felipe Restrepo',
    selected: false
  }
];
