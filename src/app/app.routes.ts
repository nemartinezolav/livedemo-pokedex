import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pokemon-list/pokemon-list.component').then(
        (m) => m.PokemonListComponent
      )
  },
  { path: '**', redirectTo: '' }
];
