import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnDestroy
} from '@angular/core';

import { InlineAlertComponent }
from '../inline-alert/inline-alert';

import { SaveSuccessService }
from '../../services/save-success-service';

@Component({
  selector: 'app-save-success-modal',
  standalone: true,
  imports: [InlineAlertComponent],
  templateUrl: './save-success-modal.html',
  styleUrl: './save-success-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveSuccessModalComponent implements OnDestroy {

  readonly saveSuccess = inject(SaveSuccessService);

  private readonly cdr = inject(ChangeDetectorRef);

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {

    effect(() => {
      const open = this.saveSuccess.visible();
      this.saveSuccess.title();
      this.saveSuccess.message();
      this.saveSuccess.tone();
      this.cdr.markForCheck();

      if (open) {
        this.armTimer();
      } else {
        this.clearTimer();
      }
    });

  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private armTimer(): void {

    this.clearTimer();
    this.timer = setTimeout(() => {
      this.saveSuccess.dismiss();
    }, 5000);

  }

  private clearTimer(): void {

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

  }

}
