import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import { CbButtonComponent }
from '../../../shared/components/cb-button/cb-button';

@Component({
  selector: 'app-standby-selection-bar',
  standalone: true,
  imports: [CbButtonComponent],
  templateUrl: './standby-selection-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbySelectionBarComponent {

  readonly visible = input(false);

  readonly addStandby = output<void>();

  onAddStandby(): void {

    console.log('CLICK BOTON');

    this.addStandby.emit();

  }

}
