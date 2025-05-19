import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  GameScoreService,
  Score,
} from '../../../core/services/game-score.service';
import { UserSessionService } from '../../../core/services/user-session.service';

@Component({
  selector: 'app-higher-lower',
  templateUrl: './higher-lower.component.html',
  styleUrl: './higher-lower.component.scss',
})
export class HigherLowerComponent {
  score = 0;
  tries = 3;
  card = 0;
  nextCard = 0;
  gameStarted = false;
  gameOver = false;
  newHighScoreMsg = '';
  cardNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  wrongGuess = false;
  constructor(
    private router: Router,
    private gameScoreService: GameScoreService,
    private userSessionService: UserSessionService
  ) {}

  ngOnInit(): void {}

  newGame() {
    this.gameStarted = true;
    this.score = 0;
    this.tries = 3;
    this.card = this.getRandomCard();
  }

  mayorMenor(opcion: 'mayor' | 'menor') {
    this.nextCard = this.getRandomCard();
    const correcto =
      (opcion === 'mayor' && this.nextCard > this.card) ||
      (opcion === 'menor' && this.nextCard < this.card);

    if (correcto) {
      this.score++;
    } else {
      this.tries--;
      this.wrongGuess = true;

      setTimeout(() => {
      this.wrongGuess = false;
    }, 500);
    }

    this.card = this.nextCard;

    if (this.tries === 0) {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    this.gameStarted = false;

    // Guardar el score
    this.saveScore();

    // Verificar si entra al top 10
    this.gameScoreService
      .getLeaderboard('Mayor o Menor', 10)
      .subscribe((leaderboard) => {
        let qualifies = false;
        if (leaderboard.length < 10) {
          qualifies = true;
        } else {
          const minScore = Math.min(...leaderboard.map((s) => s.score));
          qualifies = this.score > minScore;
        }
        this.newHighScoreMsg = qualifies ? '¡Nuevo puntaje más alto!' : '';
      });
  }

  saveScore(): void {
    const playerName = this.userSessionService.getUserEmail() || 'Jugador';
    const scoreData: Score = {
      name: playerName,
      score: this.score,
      date: new Date().toLocaleDateString(),
      game: 'Mayor o Menor',
    };
    this.gameScoreService.addScore(scoreData).catch((error: any) => {
      console.error('Error guardando el puntaje', error);
    });
  }
  checkLeaderboard(currentScore: number) {
    this.gameScoreService
      .getLeaderboard('Mayor o Menor', 10)
      .subscribe((leaderboard) => {
        let qualifies = false;
        if (leaderboard.length < 10) {
          qualifies = true;
        } else {
          const minScore = Math.min(...leaderboard.map((s) => s.score));
          qualifies = currentScore >= minScore;
        }

        if (qualifies) {
          this.showAlert('¡Nuevo puntaje entre los mejores!', 'info');
        }
      });
  }

  getRandomCard(): number {
    let newCard = this.card;
    while (newCard === this.card) {
      newCard =
        this.cardNumber[Math.floor(Math.random() * this.cardNumber.length)];
    }
    return newCard;
  }

  showAlert(text: string, type: 'error' | 'info') {
    const alertEvent = new CustomEvent('retro-alert', {
      detail: {
        message: text,
        type: type,
      },
    });
    window.dispatchEvent(alertEvent);
  }
}
