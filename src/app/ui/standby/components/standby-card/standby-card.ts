import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import { StandbyApplication }
from '../../models/standby-application-model';

@Component({
  selector: 'app-standby-card',
  standalone: true,
  templateUrl: './standby-card.html',
  styleUrl: './standby-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyCardComponent {

  readonly application = input.required<StandbyApplication>();

  readonly hasStandby = input(false);

  readonly activeThisMonth = input(false);

  readonly isSelected = input(false);

  readonly highlighted = input(false);

  /** Otras áreas: oculta código de app y muestra el servicio. */
  readonly serviceMode = input(false);

  readonly selected = output<number>();

  readonly view = output<number>();

  readonly edit = output<number>();

  toggleSelection(): void {

    const app = this.application();

    if (this.hasStandby()) {
      return;
    }

    this.selected.emit(app.id);

  }

  onView(event: Event): void {

    event.stopPropagation();
    this.view.emit(this.application().id);

  }

  onEdit(event: Event): void {

    event.stopPropagation();
    this.edit.emit(this.application().id);

  }

}