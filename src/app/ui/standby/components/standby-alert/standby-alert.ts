import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import { CbButtonComponent }
from '../../../shared/components/cb-button/cb-button';

@Component({
  selector: 'app-standby-alert',
  standalone: true,
  imports: [CbButtonComponent],
  templateUrl: './standby-alert.html',
  styleUrl: './standby-alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyAlertComponent {

  readonly visible = input(false);

  readonly title = input('Confirmación');

  readonly message = input('');

  readonly variant = input<'info' | 'success'>('info');

  readonly confirmMode = input(false);

  readonly confirmLabel = input('Confirmar');

  readonly cancelLabel = input('Cancelar');

  readonly closed = output<void>();

  readonly confirmed = output<void>();

  readonly cancelled = output<void>();

  close(): void {

    this.closed.emit();

  }

  confirm(): void {

    this.confirmed.emit();

  }

  cancel(): void {

    this.cancelled.emit();

  }

}