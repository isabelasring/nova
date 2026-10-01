import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal
} from '@angular/core';

import { CappedSlotOption }
from '../../models/capped-slot-option-model';

@Component({
  selector: 'app-capped-slot-adder',
  standalone: true,
  templateUrl: './capped-slot-adder.html',
  styleUrl: './capped-slot-adder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CappedSlotAdderComponent {

  readonly title = input('Elementos');

  readonly hint = input(
    'Agrega de a uno. Máximo 4.'
  );

  readonly emptyLabel = input('Agregar');

  readonly fullLabel = input('Cupo completo · máximo 4');

  readonly options = input<CappedSlotOption[]>([]);

  readonly max = input(4);

  readonly values = model<string[]>([]);

  readonly pickerOpen = signal(false);

  readonly shakeFull = signal(false);

  readonly count = computed(() => this.values().length);

  readonly isFull = computed(
    () => this.count() >= this.max()
  );

  readonly slots = computed(() =>
    Array.from({ length: this.max() }, (_, index) => ({
      index,
      value: this.values()[index] ?? null,
      filled: index < this.count()
    }))
  );

  readonly availableOptions = computed(() => {

    const selected = new Set(this.values());

    return this.options().filter(
      option => !selected.has(option.value)
    );

  });

  readonly ghostIndexes = computed(() => {

    if (this.isFull()) {
      return [];
    }

    const remaining = this.max() - this.count() - 1;

    return Array.from(
      { length: Math.max(0, remaining) },
      (_, index) => this.count() + 2 + index
    );

  });

  trackLabel(value: string): string {

    return (
      this.options().find(option => option.value === value)
        ?.label ?? value
    );

  }

  openPicker(event: Event): void {

    event.stopPropagation();

    if (this.isFull()) {
      this.pulseFull();
      return;
    }

    this.pickerOpen.update(open => !open);

  }

  closePicker(): void {

    this.pickerOpen.set(false);

  }

  add(value: string, event: Event): void {

    event.stopPropagation();

    if (this.isFull() || this.values().includes(value)) {
      this.pulseFull();
      return;
    }

    this.values.update(list => [...list, value]);
    this.pickerOpen.set(false);

  }

  remove(value: string, event: Event): void {

    event.stopPropagation();

    this.values.update(list =>
      list.filter(item => item !== value)
    );

  }

  private pulseFull(): void {

    this.shakeFull.set(true);

    window.setTimeout(() => {
      this.shakeFull.set(false);
    }, 480);

  }

}
