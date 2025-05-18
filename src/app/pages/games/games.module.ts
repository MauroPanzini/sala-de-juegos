import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesRoutingModule } from './games-routing.module';
import { GamesComponent } from './games.component';
import { HangmanComponent } from './hangman/hangman.component';
import { TriviaComponent } from './trivia/trivia.component';
import { HigherLowerComponent } from './higher-lower/higher-lower.component';
import { RetroAlertComponent } from '../../shared/components/retro-alert/retro-alert.component';
import { MinesweeperComponent } from './minesweeper/minesweeper.component'

@NgModule({
  declarations: [
    GamesComponent,
    HangmanComponent,
    TriviaComponent,
    HigherLowerComponent,
    MinesweeperComponent
  ],
  imports: [CommonModule, GamesRoutingModule, RetroAlertComponent],
})
export class GamesModule {}
