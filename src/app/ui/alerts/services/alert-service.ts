import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import {
  Alerta,
  AlertaAplicacion,
  AlertaAsignacion,
  AlertaComentario,
  AlertaEstado,
  AlertaSeveridad,
  AlertaTraza,
  AlertaVista
} from '../models/alert-model';

import { ALERTAS_MOCK } from '../mocks/alert-mock';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  private readonly alertsSource =
    signal<Alerta[]>(
      ALERTAS_MOCK.map((alerta, index) =>
        AlertsService.asignarAutomaticamente(alerta, index)
      )
    );

  readonly alerts = this.alertsSource.asReadonly();

  /** Activas por defecto. Resueltas y asignadas viven en su pestaña. */
  readonly filterEstado = signal<AlertaVista>('PROBLEM');

  readonly filterSeveridad = signal<AlertaSeveridad | ''>('');

  readonly search = signal('');

  readonly filteredAlerts = computed(() => {

    const term = this.search().trim().toLowerCase();
    const vista = this.filterEstado();
    const severidad = this.filterSeveridad();

    return this.alerts().filter(alerta => {

      const matchEstado =
        vista === 'ASIGNADAS'
          ? Boolean(alerta.asignacion)
          : vista === 'MIAS'
            ? alerta.asignacion?.cgm === CGM_ACTUAL
            : alerta.estado === vista;
      const matchSeveridad =
        !severidad || alerta.severidad === severidad;

      const matchSearch =
        !term ||
        alerta.problema.toLowerCase().includes(term) ||
        alerta.detalle.plataforma.toLowerCase().includes(term) ||
        alerta.detalle.codigoApp.toLowerCase().includes(term) ||
        alerta.detalle.aplicacion.toLowerCase().includes(term);

      return matchEstado && matchSeveridad && matchSearch;

    });

  });

  countVista(vista: AlertaVista): number {

    return this.alerts().filter(alerta => {

      if (vista === 'ASIGNADAS') {
        return Boolean(alerta.asignacion);
      }

      if (vista === 'MIAS') {
        return alerta.asignacion?.cgm === CGM_ACTUAL;
      }

      return alerta.estado === vista;

    }).length;

  }

  getById(id: string): Alerta | undefined {
    return this.alertsSource().find(alerta => alerta.id === id);
  }

  addComment(alertaId: string, texto: string): AlertaComentario | null {
    const trimmed = texto.trim();
    if (!trimmed) {
      return null;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fechaHora =
      `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const comentario: AlertaComentario = {
      id: `c-${Date.now()}`,
      autor: 'Usuario CGM',
      rol: 'CGM',
      fechaHora,
      texto: trimmed
    };

    this.alertsSource.update(list =>
      list.map(alerta => {
        if (alerta.id !== alertaId) {
          return alerta;
        }

        const comentariosCgm = [...alerta.comentariosCgm, comentario];
        const trazas = [
          ...(alerta.trazas ?? []),
          {
            id: `t-${Date.now()}`,
            fechaHora,
            usuario: comentario.autor,
            mensaje: trimmed
          }
        ];
        return {
          ...alerta,
          comentariosCgm,
          comentarios: comentariosCgm.length,
          trazas
        };
      })
    );

    return comentario;
  }

  registrarActualizacion(alertaId: string): void {
    const alerta = this.getById(alertaId);
    if (!alerta) {
      return;
    }

    const fechaHora = AlertsService.ahora();
    const traza: AlertaTraza = {
      id: `t-${Date.now()}`,
      fechaHora,
        usuario: alerta.asignacion?.cgm ?? 'Nova',
      mensaje: 'Se solicita actualización de la alerta'
    };

    this.alertsSource.update(list =>
      list.map(item =>
        item.id === alertaId
          ? { ...item, trazas: [...(item.trazas ?? []), traza] }
          : item
      )
    );
  }

  /**
   * Asigna cada problema activo a un CGM y deja el primer paso
   * de la trazabilidad (aviso por correo).
   */
  private static asignarAutomaticamente(
    alerta: Alerta,
    index: number
  ): Alerta {
    const comentariosCgm = [...(alerta.comentariosCgm ?? [])];
    const aplicacionesAfectadas = AlertsService.aplicacionesDe(alerta);
    const base: Alerta = {
      ...alerta,
      comentariosCgm,
      comentarios: comentariosCgm.length,
      aplicacionesAfectadas,
      descripcion: DESCRIPCIONES[alerta.id] ?? alerta.problema,
      trazas: [...(alerta.trazas ?? [])]
    };

    if (alerta.estado !== 'PROBLEM' || alerta.asignacion) {
      return base;
    }

    const cgm = CGM_TURNO[index % CGM_TURNO.length];
    const asignacion: AlertaAsignacion = {
      cgm: cgm.nombre,
      correo: cgm.correo,
      fechaHora: alerta.fechaHora
    };
    const trazas: AlertaTraza[] = [
      {
        id: `${alerta.id}-asig`,
        fechaHora: alerta.fechaHora,
        usuario: cgm.nombre,
        mensaje: `Se envía correo a ${cgm.correo}`
      },
      {
        id: `${alerta.id}-cgm`,
        fechaHora: alerta.fechaHora,
        usuario: 'Nova',
        mensaje: `Se asigna automáticamente a ${cgm.nombre}`
      },
      ...comentariosCgm.map(comentario => ({
        id: `${alerta.id}-${comentario.id}`,
        fechaHora: comentario.fechaHora,
        usuario: comentario.autor,
        mensaje: comentario.texto
      }))
    ];

    return { ...base, asignacion, trazas };
  }

  private static aplicacionesDe(alerta: Alerta): AlertaAplicacion[] {
    const extra = APLICACIONES_EXTRA[alerta.id] ?? [];
    const principal: AlertaAplicacion = {
      codigo: alerta.detalle.codigoApp,
      nombre: alerta.detalle.aplicacion
    };
    const todas = [principal, ...extra];
    const vistas = new Set<string>();

    return todas.filter(app => {
      if (!app.codigo || vistas.has(app.codigo)) {
        return false;
      }
      vistas.add(app.codigo);
      return true;
    });
  }

  private static ahora(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    );
  }

  static severityClass(severidad: AlertaSeveridad): string {
    switch (severidad) {
      case 'High':
        return 'severity--high';
      case 'Medium':
        return 'severity--medium';
      case 'Low':
        return 'severity--low';
      case 'Information':
        return 'severity--information';
      default:
        return '';
    }
  }

  static estadoClass(estado: AlertaEstado): string {
    return estado === 'RESOLVED'
      ? 'estado--resolved'
      : 'estado--problem';
  }

  static hostLabel(host: string): string {
    switch (host) {
      case 'dynatrace':
        return 'Dynatrace';
      case 'cloudwatch':
        return 'CloudWatch';
      case 'aiops_cloudwatch':
        return 'AIOps CW';
      case 'desarrollos':
        return 'Desarrollos';
      default:
        return host;
    }
  }

}

const CGM_ACTUAL = 'Ana Morales';

const CGM_TURNO = [
  { nombre: CGM_ACTUAL, correo: 'admin@empresa.com' },
  { nombre: 'Laura Gómez', correo: 'laura.gomez@bancolombia.com.co' },
  { nombre: 'Julián Castaño', correo: 'julian.castano@bancolombia.com.co' }
];

const DESCRIPCIONES: Record<string, string> = {
  'al-001':
    'La latencia del percentil 99 superó 8 segundos en el cluster de pagos en producción. Transferencias y débito en línea están más lentos.',
  'al-002':
    'El tiempo de respuesta del API Gateway cruzó el umbral de la alarma TargetResponseTime. El servicio ya se recuperó.',
  'al-003':
    'AIOps correlacionó un pico de errores 5xx en el microservicio de notificaciones. Siguen fallando envíos.',
  'al-004':
    'La tasa de error del servicio de autenticación pasó del 5 %. La alarma ya quedó resuelta.',
  'al-005':
    'El job batch de conciliación en QA lleva más de 30 minutos de retraso respecto a su ventana.',
  'al-006':
    'La CPU de la réplica de lectura de RDS superó el umbral y volvió a la normalidad en pocos minutos.',
  'al-007':
    'La cola SQS de fraudes acumula mensajes antiguos por encima del umbral de antigüedad.',
  'al-008':
    'El monitor sintético del login móvil se degradó y ya recuperó el umbral.'
};

const APLICACIONES_EXTRA: Record<string, AlertaAplicacion[]> = {
  'al-001': [
    { codigo: 'NU0044001', nombre: 'Canal pagos' },
    { codigo: 'NU0043001', nombre: 'Transferencias' }
  ],
  'al-003': [
    { codigo: 'AP0335001', nombre: 'Reportería' }
  ]
};