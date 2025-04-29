import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent {
  games = [
    { name: 'Juego 1', image: 'assets/juego1.png' },
    { name: 'Juego 2', image: 'assets/juego2.png' },
    { name: 'Juego 3', image: 'assets/juego3.png' },
    { name: 'Juego 4', image: 'assets/juego4.png' }
  ];
  
  selectedGame = 0;

  prevGame() {
    this.selectedGame = (this.selectedGame - 1 + this.games.length) % this.games.length;
  }

  nextGame() {
    this.selectedGame = (this.selectedGame + 1) % this.games.length;
  }
}
