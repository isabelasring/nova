import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject
} from '@angular/core';

import { SaveSuccessService }
from '../../services/save-success-service';

@Component({
  selector: 'app-save-success-modal',
  standalone: true,
  templateUrl: './save-success-modal.html',
  styleUrl: './save-success-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveSuccessModalComponent {

  readonly saveSuccess = inject(SaveSuccessService);

  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {

    effect(() => {
      this.saveSuccess.visible();
      this.saveSuccess.title();
      this.saveSuccess.message();
      this.saveSuccess.buttonLabel();
      this.cdr.markForCheck();
    });

  }

}
