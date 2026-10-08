import {
  Injectable,
  computed,
  signal
} from '@angular/core';

export type DownloadStatus =
  | 'queued'
  | 'running'
  | 'ready'
  | 'error';

export interface DownloadJob {
  id: number;
  filename: string;
  status: DownloadStatus;
  progress: number;
  message: string;
  blob: Blob | null;
  produce: () => Blob;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadTrayService {

  private readonly jobsSource = signal<DownloadJob[]>([]);

  readonly jobs = this.jobsSource.asReadonly();

  readonly collapsed = signal(false);

  readonly visible = computed(() =>
    this.jobsSource().length > 0
  );

  readonly title = computed(() => {

    const jobs = this.jobsSource();
    const total = jobs.length;
    const runningIndex = jobs.findIndex(
      job => job.status === 'running'
    );

    if (runningIndex >= 0) {
      return `Preparando descarga (${runningIndex + 1} de ${total})`;
    }

    if (jobs.some(job => job.status === 'queued')) {
      const next = jobs.findIndex(job => job.status === 'queued');
      return `Preparando descarga (${next + 1} de ${total})`;
    }

    if (jobs.some(job => job.status === 'error')) {
      return 'Descargas con errores';
    }

    return 'Descargas listas';

  });

  readonly busy = computed(() =>
    this.jobsSource().some(job =>
      job.status === 'running' || job.status === 'queued'
    )
  );

  private timer: ReturnType<typeof setInterval> | null = null;

  private nextId = 1;

  enqueue(filename: string, produce: () => Blob): void {

    const job: DownloadJob = {
      id: this.nextId,
      filename,
      status: 'queued',
      progress: 0,
      message: '',
      blob: null,
      produce
    };

    this.nextId += 1;
    this.collapsed.set(false);
    this.jobsSource.update(list => [...list, job]);
    this.pump();

  }

  retry(id: number): void {

    this.jobsSource.update(list =>
      list.map(job =>
        job.id === id
          ? {
              ...job,
              status: 'queued' as const,
              progress: 0,
              message: '',
              blob: null
            }
          : job
      )
    );

    this.pump();

  }

  dismiss(id: number): void {

    this.jobsSource.update(list =>
      list.filter(job => job.id !== id)
    );

    if (this.jobsSource().length === 0) {
      this.stop();
    } else {
      this.pump();
    }

  }

  toggleCollapsed(): void {

    this.collapsed.update(value => !value);

  }

  static csv(rows: string[][]): Blob {

    const body = rows.map(row =>
      row.map(cell => {
        const text = `${cell ?? ''}`;

        if (/[",\n]/.test(text)) {
          return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
      }).join(',')
    ).join('\r\n');

    return new Blob(
      ['\uFEFF' + body],
      { type: 'text/csv;charset=utf-8' }
    );

  }

  saveFile(job: DownloadJob): void {

    if (!job.blob || job.status !== 'ready') {
      return;
    }

    const url = URL.createObjectURL(job.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = job.filename;
    link.click();
    URL.revokeObjectURL(url);

  }

  private pump(): void {

    const jobs = this.jobsSource();
    const running = jobs.some(job => job.status === 'running');

    if (running) {
      this.ensureTimer();
      return;
    }

    const next = jobs.find(job => job.status === 'queued');

    if (!next) {
      this.stop();
      return;
    }

    let blob: Blob | null = null;
    let message = '';

    try {
      blob = next.produce();
    } catch (error) {
      message = error instanceof Error
        ? error.message
        : 'Error al generar el archivo';
    }

    this.jobsSource.update(list =>
      list.map(job => {

        if (job.id !== next.id) {
          return job;
        }

        if (!blob) {
          return {
            ...job,
            status: 'error' as const,
            progress: 100,
            message: message || 'Error al generar el archivo',
            blob: null
          };
        }

        return {
          ...job,
          status: 'running' as const,
          progress: 8,
          message: '',
          blob
        };

      })
    );

    this.ensureTimer();

  }

  private ensureTimer(): void {

    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {

      let finished = false;

      this.jobsSource.update(list =>
        list.map(job => {

          if (job.status !== 'running') {
            return job;
          }

          const progress = Math.min(100, job.progress + 12);

          if (progress >= 100) {
            finished = true;
            return {
              ...job,
              status: 'ready' as const,
              progress: 100
            };
          }

          return { ...job, progress };

        })
      );

      if (finished) {
        this.stop();
        this.pump();
      }

    }, 180);

  }

  private stop(): void {

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

  }

}
