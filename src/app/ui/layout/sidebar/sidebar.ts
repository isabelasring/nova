import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

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

  readonly collapsed = input(false);

  readonly toggle = output<void>();

  readonly isDark = signal(this.readDark());

  constructor() {

    this.applyTheme(this.isDark());

  }

  onToggle(): void {

    this.toggle.emit();

  }

  onToggleTheme(): void {

    const next = !this.isDark();
    this.isDark.set(next);
    this.applyTheme(next);

  }

  private readDark(): boolean {

    if (typeof document === 'undefined') {
      return false;
    }

    return document.documentElement.getAttribute('data-theme') === 'dark';

  }

  private applyTheme(dark: boolean): void {

    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute(
      'data-theme',
      dark ? 'dark' : 'light'
    );

  }

}
