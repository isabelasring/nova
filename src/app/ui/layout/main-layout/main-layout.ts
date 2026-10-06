import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { SaveSuccessModalComponent }
from '../../shared/components/save-success-modal/save-success-modal';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    SaveSuccessModalComponent
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {

  sidebarCollapsed = false;

  toggleSidebar(): void {

    this.sidebarCollapsed =
      !this.sidebarCollapsed;

  }

}
