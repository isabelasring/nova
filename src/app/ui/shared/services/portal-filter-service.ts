import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import {
  EMPTY_PORTAL_FILTER,
  PortalFilterable,
  PortalFilterDimension,
  PortalFilterState,
  PORTAL_EVC_OPTIONS,
  PORTAL_CELULA_OPTIONS,
  PORTAL_LC_OPTIONS,
  PORTAL_SERVICE_OPTIONS
} from '../models/portal-filter.model';

import { STANDBY_APPLICATIONS }
from '../../features/stanby/mocks/standby-applications.mock';

import { STANDBY_USER_PHONES }
from '../../features/stanby/mocks/standby-user-phones.mock';

@Injectable({
  providedIn: 'root'
})
export class PortalFilterService {

  private readonly filtersSource =
    signal<PortalFilterState>({ ...EMPTY_PORTAL_FILTER });

  readonly filters = this.filtersSource.asReadonly();

  readonly activeCount = computed(() => {

    const state = this.filters();

    return (
      Object.values(state) as string[]
    ).filter(Boolean).length;

  });

  readonly hasActiveFilters = computed(
    () => this.activeCount() > 0
  );

  readonly bvcOptions = computed(() =>
    this.mergeOptions(
      [...PORTAL_EVC_OPTIONS],
      STANDBY_APPLICATIONS.map(app => app.bvc)
    )
  );

  readonly ldcOptions = computed(() =>
    this.mergeOptions(
      [...PORTAL_LC_OPTIONS],
      STANDBY_APPLICATIONS.map(app => app.ldc)
    )
  );

  readonly celulaOptions = computed(() =>
    this.mergeOptions(
      [...PORTAL_CELULA_OPTIONS],
      STANDBY_APPLICATIONS.map(app => app.celula)
    )
  );

  readonly serviceOptions = computed(() =>
    this.mergeOptions(
      [...PORTAL_SERVICE_OPTIONS],
      STANDBY_APPLICATIONS.map(app => app.service)
    )
  );

  readonly appOptions = computed(() =>
    [...STANDBY_APPLICATIONS]
      .map(app => ({
        value: app.codigoAplicacion,
        label: `${app.codigoAplicacion} · ${app.nombreAplicacion}`
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, 'es')
      )
  );

  readonly userOptions = computed(() => {

    const names = new Set<string>([
      ...Object.keys(STANDBY_USER_PHONES),
      ...STANDBY_APPLICATIONS.map(app => app.responsable)
    ]);

    return [...names].sort((a, b) =>
      a.localeCompare(b, 'es')
    );

  });

  setFilter(
    dimension: PortalFilterDimension,
    value: string
  ): void {

    this.filtersSource.update(current => ({
      ...current,
      [dimension]: value
    }));

  }

  toggleFilter(
    dimension: PortalFilterDimension,
    value: string
  ): void {

    this.filtersSource.update(current => ({
      ...current,
      [dimension]:
        current[dimension] === value ? '' : value
    }));

  }

  clearFilter(dimension: PortalFilterDimension): void {

    this.setFilter(dimension, '');

  }

  clearAll(): void {

    this.filtersSource.set({ ...EMPTY_PORTAL_FILTER });

  }

  matches(item: PortalFilterable): boolean {

    const state = this.filters();

    if (state.bvc && item.bvc !== state.bvc) {
      return false;
    }

    if (state.ldc && item.ldc !== state.ldc) {
      return false;
    }

    if (state.celula && item.celula !== state.celula) {
      return false;
    }

    if (state.service && item.service !== state.service) {
      return false;
    }

    if (state.app) {

      const code = item.codigoAplicacion ?? '';
      const name = item.nombreAplicacion ?? '';

      if (
        code !== state.app &&
        name !== state.app
      ) {
        return false;
      }

    }

    if (state.user) {

      const person =
        item.responsable ??
        item.nombre ??
        '';

      if (
        !person
          .toLowerCase()
          .includes(state.user.toLowerCase())
      ) {
        return false;
      }

    }

    return true;

  }

  private mergeOptions(
    base: string[],
    extras: string[]
  ): string[] {

    return [
      ...new Set([
        ...base,
        ...extras.filter(Boolean)
      ])
    ].sort((a, b) => a.localeCompare(b, 'es'));

  }

}
