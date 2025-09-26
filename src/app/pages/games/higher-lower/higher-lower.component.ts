import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  GameScoreService,
  Score,
} from '../../../core/services/game-score.service';
import { UserSessionService } from '../../../core/services/user-session.service';
import { SoundService } from '../../../core/services/sound.service';
import { SoundSettingsService } from '../../../core/services/sound-settings.service';

interface Card {
  number: number;
  suit: 'copa' | 'basto' | 'espada' | 'oro';
}

@Component({
  selector: 'app-higher-lower',
  templateUrl: './higher-lower.component.html',
  styleUrls: ['./higher-lower.component.scss'],
})
export class HigherLowerComponent {
  score = 0;
  tries = 3;
  card!: Card;
  nextCard!: Card;
  gameStarted = false;
  gameOver = false;
  newHighScoreMsg = '';
  wrongGuess = false;
  deck: Card[] = [];

  
  constructor(
    private router: Router,
    private gameScoreService: GameScoreService,
    private userSessionService: UserSessionService,
    private soundService: SoundService,
    private soundSettings: SoundSettingsService
  ) {}

   ngOnInit(): void {
    this.generateDeck();
  }

  generateDeck() {
    const suits: Card['suit'][] = ['copa', 'basto', 'espada', 'oro'];
    this.deck = [];
    for (let n = 1; n <= 12; n++) {
      for (let s of suits) {
        this.deck.push({ number: n, suit: s });
      }
    }
    this.shuffleDeck();
  }

  shuffleDeck() {
    this.deck = this.deck
      .map((c) => ({ card: c, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((c) => c.card);
  }

  newGame() {
    this.generateDeck();
    this.gameStarted = true;
    this.score = 0;
    this.tries = 3;
    this.gameOver = false;
    this.card = this.deck.pop()!;
  }

  mayorMenor(opcion: 'mayor' | 'menor') {
    this.nextCard = this.deck.pop()!;
    const correcto =
      (opcion === 'mayor' && this.nextCard.number >= this.card.number) ||
      (opcion === 'menor' && this.nextCard.number <= this.card.number);

    if (correcto) {
      if (this.soundSettings.isUXEnabledValue()) {
        this.soundService.play('accionPositiva');
      }
      this.score++;
    } else {
      if (this.soundSettings.isUXEnabledValue()) {
        this.soundService.play('accionNegativa');
      }
      this.tries--;
      this.wrongGuess = true;

      setTimeout(() => (this.wrongGuess = false), 500);
    }

    this.card = this.nextCard;

    if (this.tries === 0 || this.deck.length === 0) {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    this.gameStarted = false;
    this.saveScore();

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
}