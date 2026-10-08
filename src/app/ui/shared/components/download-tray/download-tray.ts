import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject
} from '@angular/core';

import {
  DownloadJob,
  DownloadTrayService
} from '../../services/download-tray-service';

@Component({
  selector: 'app-download-tray',
  standalone: true,
  templateUrl: './download-tray.html',
  styleUrl: './download-tray.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadTrayComponent {

  readonly tray = inject(DownloadTrayService);

  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {

    effect(() => {
      this.tray.jobs();
      this.tray.collapsed();
      this.tray.title();
      this.tray.busy();
      this.cdr.markForCheck();
    });

  }

  trackJob(_index: number, job: DownloadJob): number {
    return job.id;
  }

}
