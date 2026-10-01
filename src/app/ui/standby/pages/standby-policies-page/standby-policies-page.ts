import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  STANDBY_POLICY_META,
  STANDBY_POLICY_PRINCIPLES,
  STANDBY_POLICY_SECTIONS
} from '../../data/standby-policies.data';

@Component({
  selector: 'app-standby-policies-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './standby-policies-page.html',
  styleUrl: './standby-policies-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyPoliciesPageComponent {

  readonly meta = STANDBY_POLICY_META;

  readonly sections = STANDBY_POLICY_SECTIONS;

  readonly principles = STANDBY_POLICY_PRINCIPLES;

  scrollToSection(id: string): void {

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

  }

}