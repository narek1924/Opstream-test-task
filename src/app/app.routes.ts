import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/schema-select/schema-select.component').then((m) => m.SchemaSelectComponent)
  },
  {
    path: 'request/:schemaId/summary',
    loadComponent: () =>
      import('./pages/request-summary/request-summary.component').then((m) => m.RequestSummaryComponent)
  },
  {
    path: 'request/:schemaId/:sectionIndex',
    loadComponent: () =>
      import('./pages/request-form/request-form.component').then((m) => m.RequestFormComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
