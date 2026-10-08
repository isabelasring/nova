import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';

@Component({
  selector: 'cb-button',
  standalone: true,
  templateUrl: './cb-button.html',
  styleUrl: './cb-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CbButtonComponent {

  readonly typeButton = input<'primary' | 'secondary' | 'danger'>('primary');

  readonly sizeButton = input<'small' | 'default'>('default');

  readonly width = input<'hug' | 'fill'>('hug');

  readonly disabled = input(false);

}
