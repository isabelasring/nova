import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { ThemeService }
from '../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {

  private readonly themeService =
    inject(ThemeService);

  readonly collapsed = input(false);

  readonly toggle = output<void>();

  get isDark(): boolean {

    return this.themeService.theme() === 'dark';

  }

  onToggle(): void {

    this.toggle.emit();

  }

  onToggleTheme(): void {

    this.themeService.toggle();

  }

}
