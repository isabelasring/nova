import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  input,
  signal
} from '@angular/core';

import {
  PORTAL_ENTITY_DIMENSIONS,
  PORTAL_FILTER_LABELS,
  PORTAL_ORG_DIMENSIONS,
  PortalFilterDimension
} from '../../models/portal-filter.model';

import { PortalFilterService }
from '../../services/portal-filter.service';

interface FilterChip {
  key: PortalFilterDimension;
  label: string;
}

@Component({
  selector: 'app-portal-filter-bar',
  standalone: true,
  templateUrl: './portal-filter-bar.html',
  styleUrl: './portal-filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortalFilterBarComponent {

  readonly portalFilter = inject(PortalFilterService);

  /** Dimensiones a ocultar (p. ej. `app` en Standby de otras áreas). */
  readonly hiddenDimensions = input<PortalFilterDimension[]>([]);

  readonly openDimension =
    signal<PortalFilterDimension | null>(null);

  readonly allChips = computed<FilterChip[]>(() => {
    const hidden = new Set(this.hiddenDimensions());

    return [
      ...PORTAL_ORG_DIMENSIONS,
      ...PORTAL_ENTITY_DIMENSIONS
    ]
      .filter(key => !hidden.has(key))
      .map(key => ({
        key,
        label: PORTAL_FILTER_LABELS[key]
      }));
  });

  readonly activeSummary = computed(() => {

    const state = this.portalFilter.filters();
    const chips: { key: PortalFilterDimension; text: string }[] = [];

    (
      Object.keys(state) as PortalFilterDimension[]
    ).forEach(key => {

      const value = state[key];

      if (!value) {
        return;
      }

      const label = PORTAL_FILTER_LABELS[key];
      const display =
        key === 'app'
          ? this.appLabel(value)
          : value;

      chips.push({
        key,
        text: `${label}: ${display}`
      });

    });

    return chips;

  });

  @HostListener('document:click')
  onDocumentClick(): void {

    this.openDimension.set(null);

  }

  toggleMenu(
    dimension: PortalFilterDimension,
    event: Event
  ): void {

    event.stopPropagation();

    this.openDimension.update(current =>
      current === dimension ? null : dimension
    );

  }

  optionsFor(
    dimension: PortalFilterDimension
  ): { value: string; label: string }[] {

    switch (dimension) {

      case 'bvc':
        return this.portalFilter.bvcOptions().map(value => ({
          value,
          label: value
        }));

      case 'ldc':
        return this.portalFilter.ldcOptions().map(value => ({
          value,
          label: value
        }));

      case 'celula':
        return this.portalFilter.celulaOptions().map(value => ({
          value,
          label: value
        }));

      case 'service':
        return this.portalFilter.serviceOptions().map(value => ({
          value,
          label: value
        }));

      case 'app':
        return this.portalFilter.appOptions();

      case 'user':
        return this.portalFilter.userOptions().map(value => ({
          value,
          label: value
        }));

    }

  }

  isActive(dimension: PortalFilterDimension): boolean {

    return Boolean(this.portalFilter.filters()[dimension]);

  }

  selectedValue(
    dimension: PortalFilterDimension
  ): string {

    const value = this.portalFilter.filters()[dimension];

    if (!value) {
      return '';
    }

    return dimension === 'app'
      ? this.appLabel(value)
      : value;

  }

  selectOption(
    dimension: PortalFilterDimension,
    value: string,
    event: Event
  ): void {

    event.stopPropagation();
    this.portalFilter.toggleFilter(dimension, value);
    this.openDimension.set(null);

  }

  clearDimension(
    dimension: PortalFilterDimension,
    event: Event
  ): void {

    event.stopPropagation();
    this.portalFilter.clearFilter(dimension);

  }

  clearAll(event: Event): void {

    event.stopPropagation();
    this.portalFilter.clearAll();
    this.openDimension.set(null);

  }

  private appLabel(code: string): string {

    const match = this.portalFilter
      .appOptions()
      .find(option => option.value === code);

    return match?.label ?? code;

  }

}
