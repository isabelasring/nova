import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent
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
