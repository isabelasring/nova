import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { BreadcrumbComponent }
from '../../shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {

  sections = [
    {
      path: '/contacts',
      code: 'C',
      title: 'Contactos',
      description:
        'Consulta y administra los contactos de cada aplicación: celular, correo, horario, EVC y línea.'
    },
    {
      path: '/alerts',
      code: 'A',
      title: 'Alertas',
      description:
        'Consulta alertas de Dynatrace, CloudWatch y AIOps, filtra por estado y severidad, y revisa el detalle operativo.'
    },
    {
      path: '/standby',
      code: 'S',
      title: 'Stand by',
      description:
        'Programa turnos de stand by por aplicación, asigna responsables y revisa el calendario de cobertura.'
    },
    {
      path: '/maintenance',
      code: 'V',
      title: 'Ventanas',
      description:
        'Crea y edita ventanas de mantenimiento, filtra por EVC o línea y da seguimiento a las programadas.'
    }
  ];

}
