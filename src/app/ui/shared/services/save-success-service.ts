import { Injectable, signal } from '@angular/core';

export type SaveNoticeTone = 'success' | 'cancelled';

export interface SaveSuccessOptions {
  title?: string;
  message?: string;
  buttonLabel?: string;
  tone?: SaveNoticeTone;
  onConfirm?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class SaveSuccessService {

  readonly visible = signal(false);

  readonly title = signal('¡Listo!');

  readonly message = signal('Tus cambios se guardaron.');

  readonly buttonLabel = signal('Continuar');

  readonly tone = signal<SaveNoticeTone>('success');

  private onConfirm: (() => void) | null = null;

  show(
    messageOrOptions:
      | string
      | SaveSuccessOptions =
      'Tus cambios se guardaron.',
    title = '¡Listo!'
  ): void {

    if (typeof messageOrOptions === 'string') {
      this.title.set(title);
      this.message.set(messageOrOptions);
      this.buttonLabel.set('Continuar');
      this.tone.set('success');
      this.onConfirm = null;
    } else {
      this.title.set(messageOrOptions.title ?? '¡Listo!');
      this.message.set(
        messageOrOptions.message ?? 'Tus cambios se guardaron.'
      );
      this.buttonLabel.set(
        messageOrOptions.buttonLabel ?? 'Continuar'
      );
      this.tone.set(messageOrOptions.tone ?? 'success');
      this.onConfirm = messageOrOptions.onConfirm ?? null;
    }

    this.visible.set(true);

  }

  confirm(): void {

    const action = this.onConfirm;
    this.dismiss();
    action?.();

  }

  dismiss(): void {

    this.visible.set(false);
    this.onConfirm = null;

  }

}