import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamesComponent } from './games.component';
import { HangmanComponent } from './hangman/hangman.component';
import { HigherLowerComponent } from './higher-lower/higher-lower.component';
import { TriviaComponent } from './trivia/trivia.component';
import { MinesweeperComponent } from './minesweeper/minesweeper.component';

const routes: Routes = [
  {
    path: '',
    component: GamesComponent,
    children: [
      { path: 'ahorcado', component: HangmanComponent },
      { path: 'preguntados', component: TriviaComponent },
      { path: 'mayor-menor', component: HigherLowerComponent },
      { path: 'buscaminas', component: MinesweeperComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamesRoutingModule {}
