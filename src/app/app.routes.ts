import { Routes } from '@angular/router';

import { MainLayoutComponent }
from './ui/layout/main-layout/main-layout';

import { HomePageComponent }
from './ui/home/pages/home-page';

import { ContactsPageComponent }
from './ui/contacts/pages/contact-page';

import { StandbyPageComponent }
from './ui/standby/pages/standby-page/standby-page';

import { StandbyConsultationPageComponent }
from './ui/standby/pages/standby-consultation-page/standby-consultation-page';

import { StandbyPoliciesPageComponent }
from './ui/standby/pages/standby-policies-page/standby-policies-page';

import { AlertsPageComponent }
from './ui/alerts/pages/alert-page';

import { MaintenancePageComponent }
from './ui/maintenance/pages/maintenance-page';

import { ProfilePageComponent }
from './ui/profile/pages/profile-page';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        component: HomePageComponent
      },
      {
        path: 'contacts',
        component: ContactsPageComponent
      },
      {
        path: 'standby',
        component: StandbyPageComponent,
        data: { scope: 'tech' }
      },
      {
        path: 'standby/other-areas',
        component: StandbyPageComponent,
        data: { scope: 'areas' }
      },
      {
        path: 'standby/consultation',
        component: StandbyConsultationPageComponent
      },
      {
        path: 'standby/policies',
        component: StandbyPoliciesPageComponent
      },
      {
        path: 'alerts',
        component: AlertsPageComponent
      },
      {
        path: 'maintenance',
        component: MaintenancePageComponent
      },
      {
        path: 'profile',
        component: ProfilePageComponent
      }
    ]
  }
];
