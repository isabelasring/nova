import { StandbyApplication }
from '../models/standby-application-model';

export const STANDBY_APPLICATIONS: StandbyApplication[] = [
  {
    id: 1,
    codigoAplicacion: 'NU0113001',
    nombreAplicacion: 'Núcleo Único',
    descripcion:
      'Núcleo transaccional central que concentra operaciones críticas del banco y servicios compartidos entre canales.',
    bvc: 'Operaciones',
    ldc: 'Aplicaciones',
    celula: 'Célula Core',
    service: 'Transaccional',
    evc: 'Célula Core',
    linea: 'Aplicaciones',
    responsable: 'Daniel Lopez Montes',
    selected: false
  },
  {
    id: 2,
    codigoAplicacion: 'NU0113002',
    nombreAplicacion: 'Portal Transaccional',
    descripcion:
      'Portal web para consultas y transacciones de clientes, con autenticación y flujos de autogestión.',
    bvc: 'Canales Digitales',
    ldc: 'Aplicaciones',
    celula: 'Célula Canales',
    service: 'Transaccional',
    evc: 'Célula Canales',
    linea: 'Aplicaciones',
    responsable: 'Bibiana Montoya',
    selected: false
  },
  {
    id: 3,
    codigoAplicacion: 'NU0113003',
    nombreAplicacion: 'App Personas',
    descripcion:
      'Aplicación móvil de banca personas para pagos, transferencias y seguimiento de productos.',
    bvc: 'Banca Personas',
    ldc: 'Aplicaciones',
    celula: 'Célula Digital',
    service: 'Transaccional',
    evc: 'Célula Digital',
    linea: 'Aplicaciones',
    responsable: 'Dylan Martinez',
    selected: false
  },
  {
    id: 4,
    codigoAplicacion: 'NU0113004',
    nombreAplicacion: 'Gestión de Alertas',
    descripcion:
      'Plataforma de monitoreo y notificación de eventos operativos para equipos de soporte y operación.',
    bvc: 'Operaciones',
    ldc: 'Monitoreo',
    celula: 'Célula Operaciones',
    service: 'Monitoreo',
    evc: 'Célula Operaciones',
    linea: 'Monitoreo',
    responsable: 'Jahiver Horacio Lopez',
    selected: false
  },
  {
    id: 5,
    codigoAplicacion: 'NU0113005',
    nombreAplicacion: 'Pasarela de Pagos',
    descripcion:
      'Servicio de mediación de pagos que integra medios de pago internos y externos en tiempo real.',
    bvc: 'Canales Digitales',
    ldc: 'Aplicaciones',
    celula: 'Célula Canales',
    service: 'Pagos',
    evc: 'Célula Canales',
    linea: 'Aplicaciones',
    responsable: 'Miguel Ángel García',
    selected: false
  },
  {
    id: 6,
    codigoAplicacion: 'NU0113006',
    nombreAplicacion: 'Créditos Digitales',
    descripcion:
      'Plataforma de originación y desembolso de créditos de consumo con evaluación automatizada de riesgo.',
    bvc: 'Banca Personas',
    ldc: 'Aplicaciones',
    celula: 'Célula Productos',
    service: 'Créditos',
    evc: 'Célula Productos',
    linea: 'Aplicaciones',
    responsable: 'Laura Camila Ruiz',
    selected: false
  },
  {
    id: 7,
    codigoAplicacion: 'NU0113007',
    nombreAplicacion: 'Tesorería Corporativa',
    descripcion:
      'Consola de gestión de liquidez, inversiones y operaciones de mesa para equipos de tesorería.',
    bvc: 'Tesorería',
    ldc: 'Backoffice',
    celula: 'Célula Finanzas',
    service: 'Transaccional',
    evc: 'Célula Finanzas',
    linea: 'Backoffice',
    responsable: 'Carlos Eduardo Vargas',
    selected: false
  },
  {
    id: 8,
    codigoAplicacion: 'NU0113008',
    nombreAplicacion: 'Reportería Regulatoria',
    descripcion:
      'Generación y envío de reportes normativos a entes de control con trazabilidad y auditoría.',
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
    id: 9,
    codigoAplicacion: 'NU0113009',
    nombreAplicacion: 'Onboarding Empresas',
    descripcion:
      'Flujo digital de vinculación de clientes corporativos con validación documental y firma electrónica.',
    bvc: 'Banca Empresas',
    ldc: 'Aplicaciones',
    celula: 'Célula Empresas',
    service: 'Onboarding',
    evc: 'Célula Empresas',
    linea: 'Aplicaciones',
    responsable: 'Andrés Felipe Mejía',
    selected: false
  },
  {
    id: 10,
    codigoAplicacion: 'NU0113010',
    nombreAplicacion: 'API Gateway Interno',
    descripcion:
      'Punto de entrada unificado para servicios internos con autenticación, rate limiting y observabilidad.',
    bvc: 'Operaciones',
    ldc: 'Infraestructura',
    celula: 'Célula Integración',
    service: 'Integración',
    evc: 'Célula Integración',
    linea: 'Infraestructura',
    responsable: 'Santiago Herrera',
    selected: false
  },
  {
    id: 11,
    codigoAplicacion: 'NU0113011',
    nombreAplicacion: 'Gestión Documental',
    descripcion:
      'Repositorio centralizado de documentos operativos con versionamiento, búsqueda y retención.',
    bvc: 'Operaciones',
    ldc: 'Backoffice',
    celula: 'Célula Operaciones',
    service: 'Onboarding',
    evc: 'Célula Operaciones',
    linea: 'Backoffice',
    responsable: 'Paula Andrea Giraldo',
    selected: false
  },
  {
    id: 12,
    codigoAplicacion: 'NU0113012',
    nombreAplicacion: 'CRM Comercial',
    descripcion:
      'Seguimiento de oportunidades comerciales, campañas y gestión de cartera para equipos de ventas.',
    bvc: 'Banca Empresas',
    ldc: 'Aplicaciones',
    celula: 'Célula Comercial',
    service: 'CRM',
    evc: 'Célula Comercial',
    linea: 'Aplicaciones',
    responsable: 'Felipe Restrepo',
    selected: false
  }
];