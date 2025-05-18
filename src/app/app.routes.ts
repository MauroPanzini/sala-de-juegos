import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { SurveyComponent } from './pages/survey/survey.component';
import { LayoutComponent } from './components/layout/layout.component';

import { RegisterComponent } from './pages/register/register.component';
import { ChatComponent } from './pages/chat/chat.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  { path: 'iniciar-sesion', component: AuthComponent },
  { path: 'registro', component: AuthComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: HomeComponent },
      {
        path: 'juegos',
        loadChildren: () =>
          import('./pages/games/games.module').then((m) => m.GamesModule),
      },
      { path: 'chat', component: ChatComponent },
      { path: 'estadisticas', component: StatisticsComponent },
      { path: 'encuesta', component: SurveyComponent },
      { path: 'sobre-mi', component: AboutComponent },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
