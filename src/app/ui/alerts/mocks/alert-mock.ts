import { Alerta } from '../models/alert-model';

export const ALERTAS_MOCK: Alerta[] = [
  {
    id: 'al-001',
    hora: '03:14:22',
    fechaHora: '22/09/2026 03:14:22',
    severidad: 'High',
    estado: 'PROBLEM',
    host: 'dynatrace',
    problema:
      'Dynatrace_P-2108842 — Latencia P99 > 8s en cluster pagos-core-prod',
    duracion: '47 min',
    comentarios: 3,
    comentariosCgm: [
      {
        id: 'c1',
        autor: 'Julián Castaño',
        rol: 'CGM',
        fechaHora: '22/09/2026 03:20:11',
        texto: 'Escalado a SRE Pagos. Revisando latencia en cluster pagos-core-prod.'
      },
      {
        id: 'c2',
        autor: 'Laura Gómez',
        rol: 'CGM',
        fechaHora: '22/09/2026 03:35:02',
        texto: 'Se identificó saturación en nodos de lectura. Equipo aplicando scale-out.'
      },
      {
        id: 'c3',
        autor: 'Carlos Méndez',
        rol: 'CGM',
        fechaHora: '22/09/2026 03:48:40',
        texto: 'Stand by en llamada con proveedor. Seguimiento cada 10 min.'
      }
    ],
    tags: [
      { key: 'cod_app', value: 'APP-PAGOS-001' },
      { key: 'entregado_cgm', value: 'true' },
      { key: 'id_acc', value: '882104455' }
    ],
    detalle: {
      plataforma: 'Dynatrace',
      nombreAlarma: 'Dynatrace_P-2108842',
      cuentaAws: '882104455 — pagos-prod',
      fechaPlataforma: '22/09/2026 03:14:22 UTC-5',
      idExterno: 'P-2108842',
      url: 'https://dynatrace.example.com/problem/P-2108842',
      entidad: 'HOST-4A2B91C',
      aplicacion: 'Pagos Core',
      codigoApp: 'APP-PAGOS-001',
      onSchedule: true,
      standby: 'Carlos Méndez · Sem 38',
      telefono: '+57 300 441 2200',
      correo: 'standby.pagos@empresa.com',
      teams: 'Standby Pagos',
      serviciosImpactados: 'Transferencias inmediatas, débito en línea',
      sla: 'Crítico — 15 min',
      analistaConfiabilidad: 'Laura Gómez',
      grupoSoporte: 'SRE Pagos',
      entregadoCgm: true,
      bia: true,
      sox: true,
      roti: true
    }
  },
  {
    id: 'al-002',
    hora: '02:58:01',
    fechaHora: '22/09/2026 02:58:01',
    severidad: 'High',
    horaRecuperacion: '03:41:18',
    estado: 'RESOLVED',
    host: 'cloudwatch',
    problema:
      'ALARM: "TargetResponseTime" in EU (arn:aws:cloudwatch:us-east-1:334009876543:alarm/api-gateway-latency)',
    duracion: '43 min',
    comentarios: 1,
    comentariosCgm: [
      {
        id: 'c4',
        autor: 'Ana Morales',
        rol: 'CGM',
        fechaHora: '22/09/2026 03:10:00',
        texto: 'Alarma de latencia API Gateway. Sin impacto en canales críticos.'
      }
    ],
    tags: [
      { key: 'cod_app', value: 'APP-API-PORTAL' },
      { key: 'entregado_cgm', value: 'false' },
      { key: 'id_acc', value: '334009876543' }
    ],
    detalle: {
      plataforma: 'Amazon CloudWatch',
      nombreAlarma: 'api-gateway-latency-prod',
      cuentaAws: '334009876543 — integracion-prod',
      fechaPlataforma: '22/09/2026 02:58:01 UTC-5',
      idExterno:
        'arn:aws:cloudwatch:us-east-1:334009876543:alarm:api-gateway-latency',
      entidad: 'API Gateway / portal-unificado',
      aplicacion: 'Portal Unificado API',
      codigoApp: 'APP-API-PORTAL',
      onSchedule: false,
      standby: 'Ana Morales',
      telefono: '+57 310 998 1200',
      correo: 'ana.morales@empresa.com',
      serviciosImpactados: 'Consulta de contactos y stand by',
      sla: 'Alto — 30 min',
      grupoSoporte: 'Plataforma Digital',
      entregadoCgm: false,
      bia: false,
      sox: false,
      roti: true
    }
  },
  {
    id: 'al-003',
    hora: '01:22:44',
    fechaHora: '22/09/2026 01:22:44',
    severidad: 'Information',
    estado: 'PROBLEM',
    host: 'aiops_cloudwatch',
    problema:
      'AIOps — Correlación: pico de errores 5xx en microservicio notificaciones',
    duracion: '2 h 12 min',
    comentarios: 0,
    comentariosCgm: [],
    tags: [
      { key: 'cod_app', value: 'APP-NOTIF-002' },
      { key: 'entregado_cgm', value: 'true' },
      { key: 'id_acc', value: '112233445566' }
    ],
    detalle: {
      plataforma: 'AIOps CloudWatch',
      nombreAlarma: 'aiops-notificaciones-5xx-correlation',
      cuentaAws: '112233445566 — mensajeria-prod',
      fechaPlataforma: '22/09/2026 01:22:44 UTC-5',
      idExterno: 'CORR-998812',
      entidad: 'ECS / notificaciones-svc',
      aplicacion: 'Notificaciones transaccionales',
      codigoApp: 'APP-NOTIF-002',
      onSchedule: true,
      standby: 'Equipo mensajería L2',
      correo: 'l2.notificaciones@empresa.com',
      teams: 'Ops Notificaciones',
      serviciosImpactados: 'SMS OTP, push móvil',
      sla: 'Medio — 60 min',
      analistaConfiabilidad: 'Diego Ruiz',
      grupoSoporte: 'Mensajería',
      entregadoCgm: true,
      bia: false,
      sox: false,
      roti: false
    }
  },
  {
    id: 'al-004',
    hora: '23:05:11',
    fechaHora: '21/09/2026 23:05:11',
    severidad: 'Medium',
    horaRecuperacion: '23:47:33',
    estado: 'RESOLVED',
    host: 'dynatrace',
    problema: 'Dynatrace_P-2108710 — Error rate > 5% servicio autenticación',
    duracion: '42 min',
    comentarios: 5,
    comentariosCgm: [
      {
        id: 'c5',
        autor: 'Diego Ruiz',
        rol: 'CGM',
        fechaHora: '21/09/2026 23:12:00',
        texto: 'Pico de errores en autenticación. Validando SSO.'
      },
      {
        id: 'c6',
        autor: 'Mesa CGM',
        rol: 'CGM',
        fechaHora: '21/09/2026 23:25:18',
        texto: 'Proveedor confirma incidente parcial. Monitoreo activo.'
      },
      {
        id: 'c7',
        autor: 'Diego Ruiz',
        rol: 'CGM',
        fechaHora: '21/09/2026 23:40:05',
        texto: 'Recuperación en curso. Marcación de llamada registrada.'
      },
      {
        id: 'c8',
        autor: 'Admin CGM',
        rol: 'Admin',
        fechaHora: '21/09/2026 23:45:00',
        texto: 'Cierre técnico pendiente de confirmación del grupo soporte.'
      },
      {
        id: 'c9',
        autor: 'Diego Ruiz',
        rol: 'CGM',
        fechaHora: '21/09/2026 23:47:33',
        texto: 'Servicio restablecido. Alerta resuelta.'
      }
    ],
    tags: [
      { key: 'cod_app', value: 'APP-IAM-010' },
      { key: 'id_acc', value: '882104455' }
    ],
    detalle: {
      plataforma: 'Dynatrace',
      nombreAlarma: 'Dynatrace_P-2108710',
      cuentaAws: '882104455 — seguridad-prod',
      fechaPlataforma: '21/09/2026 23:05:11 UTC-5',
      idExterno: 'P-2108710',
      entidad: 'SERVICE-AUTH-PROD',
      aplicacion: 'IAM Empresarial',
      codigoApp: 'APP-IAM-010',
      onSchedule: false,
      standby: 'Turno noche IAM',
      telefono: '+57 320 550 8899',
      serviciosImpactados: 'Login SSO, tokens API',
      sla: 'Crítico — 15 min',
      grupoSoporte: 'Seguridad Digital',
      entregadoCgm: true,
      bia: true,
      sox: true,
      roti: true
    }
  },
  {
    id: 'al-005',
    hora: '18:40:02',
    fechaHora: '21/09/2026 18:40:02',
    severidad: 'Low',
    estado: 'PROBLEM',
    host: 'desarrollos',
    problema:
      'Desarrollos — Job batch conciliación retrasado > 30 min (entorno QA)',
    duracion: '5 h 28 min',
    comentarios: 2,
    comentariosCgm: [
      {
        id: 'c10',
        autor: 'Dev Ops QA',
        rol: 'CGM',
        fechaHora: '21/09/2026 19:00:00',
        texto: 'Job batch retrasado en QA. Sin impacto producción.'
      },
      {
        id: 'c11',
        autor: 'Mesa CGM',
        rol: 'CGM',
        fechaHora: '21/09/2026 20:15:00',
        texto: 'Equipo desarrollo notificado.'
      }
    ],
    tags: [{ key: 'cod_app', value: 'APP-CONC-QA' }],
    detalle: {
      plataforma: 'Monitoreo desarrollos',
      nombreAlarma: 'batch-conciliacion-qa-delay',
      cuentaAws: '—',
      fechaPlataforma: '21/09/2026 18:40:02 UTC-5',
      idExterno: 'DEV-JOB-4412',
      entidad: 'Cron / conciliacion-qa',
      aplicacion: 'Conciliación QA',
      codigoApp: 'APP-CONC-QA',
      onSchedule: false,
      correo: 'dev.conciliacion@empresa.com',
      serviciosImpactados: 'Pruebas de cierre contable QA',
      sla: 'Informativo',
      grupoSoporte: 'Desarrollo Finanzas',
      entregadoCgm: false,
      bia: false,
      sox: false,
      roti: false
    }
  },
  {
    id: 'al-006',
    hora: '14:11:55',
    fechaHora: '21/09/2026 14:11:55',
    severidad: 'Information',
    horaRecuperacion: '14:15:02',
    estado: 'RESOLVED',
    host: 'cloudwatch',
    problema:
      'ALARM: "CPUUtilization" in EU (arn:aws:cloudwatch:sa-east-1:998877665544:alarm:rds-read-replica-cpu)',
    duracion: '3 min',
    comentarios: 0,
    comentariosCgm: [],
    tags: [
      { key: 'cod_app', value: 'APP-DWH-004' },
      { key: 'entregado_cgm', value: 'true' },
      { key: 'id_acc', value: '998877665544' }
    ],
    detalle: {
      plataforma: 'Amazon CloudWatch',
      nombreAlarma: 'rds-read-replica-cpu',
      cuentaAws: '998877665544 — analytics-prod',
      fechaPlataforma: '21/09/2026 14:11:55 UTC-5',
      idExterno:
        'arn:aws:cloudwatch:sa-east-1:998877665544:alarm:rds-read-replica-cpu',
      entidad: 'RDS replica analytics',
      aplicacion: 'Data Warehouse',
      codigoApp: 'APP-DWH-004',
      onSchedule: true,
      standby: 'Mesa analytics',
      serviciosImpactados: 'Reportes regulatorios (sin impacto cliente)',
      sla: 'Medio — 60 min',
      analistaConfiabilidad: 'Patricia Núñez',
      grupoSoporte: 'Analytics Ops',
      entregadoCgm: true,
      bia: false,
      sox: true,
      roti: false
    }
  },
  {
    id: 'al-007',
    hora: '09:03:17',
    fechaHora: '21/09/2026 09:03:17',
    severidad: 'High',
    estado: 'PROBLEM',
    host: 'cloudwatch',
    problema:
      'ALARM: "ApproximateAgeOfOldestMessage" SQS cola fraudes-prod',
    duracion: '21 h 9 min',
    comentarios: 3,
    comentariosCgm: [
      {
        id: 'c12',
        autor: 'María Castro',
        rol: 'CGM',
        fechaHora: '21/09/2026 09:15:00',
        texto: 'Backlog SQS fraudes. Revisando consumidores.'
      },
      {
        id: 'c13',
        autor: 'Jorge Salazar',
        rol: 'CGM',
        fechaHora: '21/09/2026 10:02:00',
        texto: 'Se reinició worker. Cola aún elevada.'
      },
      {
        id: 'c14',
        autor: 'María Castro',
        rol: 'CGM',
        fechaHora: '21/09/2026 12:40:00',
        texto: 'Escala horizontal aplicada. Seguimiento CGM 24x7.'
      }
    ],
    tags: [
      { key: 'cod_app', value: 'APP-FRAUD-007' },
      { key: 'entregado_cgm', value: 'true' },
      { key: 'id_acc', value: '556677889900' }
    ],
    detalle: {
      plataforma: 'Amazon CloudWatch',
      nombreAlarma: 'sqs-fraudes-oldest-message',
      cuentaAws: '556677889900 — riesgos-prod',
      fechaPlataforma: '21/09/2026 09:03:17 UTC-5',
      idExterno:
        'arn:aws:cloudwatch:us-east-1:556677889900:alarm:sqs-fraudes-backlog',
      entidad: 'SQS fraudes-ingesta',
      aplicacion: 'Motor antifraude',
      codigoApp: 'APP-FRAUD-007',
      onSchedule: true,
      standby: 'L1 Riesgos · María Castro',
      telefono: '+57 315 220 9988',
      correo: 'standby.fraudes@empresa.com',
      teams: 'Antifraude 24x7',
      serviciosImpactados: 'Bloqueo transacciones sospechosas',
      sla: 'Crítico — 15 min',
      analistaConfiabilidad: 'Jorge Salazar',
      grupoSoporte: 'Riesgos TI',
      entregadoCgm: true,
      bia: true,
      sox: true,
      roti: true
    }
  },
  {
    id: 'al-008',
    hora: '06:55:40',
    fechaHora: '21/09/2026 06:55:40',
    severidad: 'Information',
    estado: 'RESOLVED',
    host: 'dynatrace',
    problema:
      'Dynatrace_P-2108501 — Synthetic monitor login móvil degradado',
    horaRecuperacion: '07:12:08',
    duracion: '16 min',
    comentarios: 1,
    comentariosCgm: [
      {
        id: 'c15',
        autor: 'Canales CGM',
        rol: 'CGM',
        fechaHora: '21/09/2026 07:05:00',
        texto: 'Synthetic login móvil degradado. Validando región.'
      }
    ],
    tags: [{ key: 'cod_app', value: 'APP-MOVIL-003' }],
    detalle: {
      plataforma: 'Dynatrace',
      nombreAlarma: 'Dynatrace_P-2108501',
      cuentaAws: '882104455 — canales-prod',
      fechaPlataforma: '21/09/2026 06:55:40 UTC-5',
      idExterno: 'P-2108501',
      url: 'https://dynatrace.example.com/problem/P-2108501',
      entidad: 'SYNTHETIC-MOBILE-LOGIN',
      aplicacion: 'App móvil banca',
      codigoApp: 'APP-MOVIL-003',
      onSchedule: false,
      serviciosImpactados: 'Login app iOS/Android',
      sla: 'Alto — 30 min',
      grupoSoporte: 'Canales digitales',
      entregadoCgm: false,
      bia: true,
      sox: false,
      roti: true
    }
  }
];
