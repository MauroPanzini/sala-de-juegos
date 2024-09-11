import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component'; 

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => LoginComponent) },  // Carga el componente standalone
    { path: '', redirectTo: '/login', pathMatch: 'full' }  // Redirige al login por defecto
  ];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
