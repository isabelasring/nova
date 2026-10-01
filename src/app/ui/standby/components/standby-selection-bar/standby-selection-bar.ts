import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';


@Component({
  selector: 'app-standby-selection-bar',
  standalone: true,
  templateUrl: './standby-selection-bar.html',
  styleUrl: './standby-selection-bar.scss',
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
