import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-inline-alert',
  standalone: true,
  templateUrl: './inline-alert.html',
  styleUrl: './inline-alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineAlertComponent {

  readonly title = input('Título de la alerta');

  readonly description = input('Descripción de la alerta');

  readonly closed = output<void>();

}
