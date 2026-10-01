import { PORTAL_SERVICE_OPTIONS }
from '../../../shared/models/portal-filter-model';

import { STANDBY_APPLICATIONS }
from '../mocks/standby-applications-mock';

import { CappedSlotOption }
from '../models/capped-slot-option-model';

export const STANDBY_EMPRESA_OPTIONS = [
  'Bancolombia',
  'Banistmo',
  'Nequi',
  'Wompi'
] as const;

export const STANDBY_SERVICE_OPTIONS: CappedSlotOption[] =
  PORTAL_SERVICE_OPTIONS.map(service => ({
    value: service,
    label: service,
    hint: 'Servicio / producto soportado (PS)'
  }));

export const STANDBY_TI_SERVICE_OPTIONS: CappedSlotOption[] =
  STANDBY_APPLICATIONS.map(app => ({
    value: app.codigoAplicacion,
    label: `${app.codigoAplicacion} · ${app.nombreAplicacion}`,
    hint: app.service
  }));

export interface StandbyPersonRecord {
  id: number;
  funcionario: string;
  cedula: string;
  celular: string;
  empresa: string;
  servicios: string[];
  serviciosTi: string[];
  funcion: string;
  observaciones: string;
}
