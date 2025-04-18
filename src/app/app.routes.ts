import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { SurveyComponent } from './pages/survey/survey.component';
import { LayoutComponent } from './components/layout/layout.component';
import { GamesComponent } from './pages/games/games.component';
import { HangmanComponent } from './pages/games/hangman/hangman.component';
import { TriviaComponent } from './pages/games/trivia/trivia.component';
import { HigherLowerComponent } from './pages/games/higher-lower/higher-lower.component';
import { ConnectFourComponent } from './pages/games/connect-four/connect-four.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: 'iniciar-sesion', component: LoginComponent }, // Carga el componente standalone
  { path: 'registro', component: RegisterComponent},
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'inicio', component: HomeComponent },
      {
        path: 'juegos',
        component: GamesComponent,
        children: [
          { path: 'ahorcado', component: HangmanComponent },
          { path: 'preguntados', component: TriviaComponent },
          { path: 'mayor-menor', component: HigherLowerComponent },
          { path: 'cuatro-en-linea', component: ConnectFourComponent },
        ],
      },
      { path: 'estadisticas', component: StatisticsComponent },
      { path: 'encuesta', component: SurveyComponent },
      { path: 'sobre-mi', component: AboutComponent },
    ],
  },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }, // Redirige s inivio por defecto
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
