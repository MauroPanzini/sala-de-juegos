import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameScoreService, Score } from '../../../core/services/game-score.service';
import { UserSessionService } from '../../../core/services/user-session.service';
import { SoundService } from '../../../core/services/sound.service';
import { SoundSettingsService } from '../../../core/services/sound-settings.service';

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  styleUrls: ['./hangman.component.scss'],
})
export class HangmanComponent {
  gameFinished: boolean = false;
  retroMessage = '';
  showRetroAlert = false;
  retroType: 'success' | 'error' | 'info' = 'info';
  score: number = 0;

  finalScore: number = 0;
  newHighScoreMsg: string = '';
  gameStarted: boolean = false;

  letterStates: { [letter: string]: 'correct' | 'wrong' } = {};

  letters = [
    'A','B','C','D','E','F','G','H','I','J',
    'K','L','M','N','Ñ','O','P','Q','R','S',
    'T','U','V','W','X','Y','Z'
  ];

  tries: number = 5;
  dashes: string[] = [];
  words: string[] = [
    'neumatico',
    'submarino',
    'auditores',
    'euforia',
    'centrifugado',
    'murcielago',
    'empanada',
    'esqueleto',
    'koala',
    'farmaceutico'
  ];
  hangmanStages: string[] = [

  `
  +---+
      |
      |
      |
      |
      |
=========
`,
  `
  +---+
  |   |
  O   |
      |
      |
      |
=========
`,
  `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========
`,
  `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========
`,
  `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========
`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========
`
];


  shuffledWords: string[] = [];

  currentWordIndex: number = 0;
  wordToGuess: string = '';
  pictureNumber: number = 0;

  constructor(
    private router: Router,
    private gameScoreService: GameScoreService,
    private userSessionService: UserSessionService,
    private soundService: SoundService,
    private soundSettings: SoundSettingsService
  ) {}

  ngOnInit(): void {}

  goTo(place: string) {
    if (place === 'home') {
      this.router.navigateByUrl('home');
    } else if (place === 'login') {
      this.userSessionService.clear();
      this.router.navigateByUrl('login');
    }
  }

  newGame(): void {
    this.score = 0;
    this.finalScore = 0;
    this.newHighScoreMsg = '';
    this.currentWordIndex = 0;

    this.shuffleWords();
    this.gameStarted = true;
    this.startGame();
  }

  shuffleWords(): void {
    this.shuffledWords = [...this.words];
    for (let i = this.shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledWords[i], this.shuffledWords[j]] = [this.shuffledWords[j], this.shuffledWords[i]];
    }
  }

  startGame(): void {
    if (this.currentWordIndex >= this.shuffledWords.length) {
      this.endGame();
      return;
    }
    this.tries = 5;
    this.pictureNumber = 0;
    this.wordToGuess = this.shuffledWords[this.currentWordIndex];
    this.dashes = Array(this.wordToGuess.length).fill('_');
    this.letterStates = {};
  }

  selectLetter(selectedLetter: string): void {
    if (!this.gameStarted) return;
    if (this.letterStates[selectedLetter] !== undefined) return;

    let found = false;
    for (let i = 0; i < this.wordToGuess.length; i++) {
      if (selectedLetter.toLowerCase() === this.wordToGuess[i]) {
        this.dashes[i] = selectedLetter;
        found = true;
        this.score++;
      }
    }
    this.letterStates[selectedLetter] = found ? 'correct' : 'wrong';

    if (!found) {
      this.tries--;
      if(this.soundSettings.isUXEnabledValue()){
        this.soundService.play('accionNegativa');
      }
      if (this.tries === 0) {
        this.endGame();
        return;
      }
    }
    else{
      if(this.soundSettings.isUXEnabledValue()){
        this.soundService.play('accionPositiva')

      }
    }
    this.checkWinner();
  }

  checkWinner(): void {
    if (this.dashes.includes('_')) return;
    this.showAlert('success', 'Siguiente palabra');
    setTimeout(() => {
      this.nextWord();
    }, 2000);
  }

  nextWord(): void {
    this.currentWordIndex++;
    if (this.currentWordIndex < this.shuffledWords.length) {
      this.startGame();
    } else {
      this.endGame();
    }
  }

  endGame(): void {
  this.gameStarted = false;
  this.gameFinished = true; 
  this.finalScore = this.score;
  this.saveScore();
  this.gameScoreService.getLeaderboard('Ahorcado', 10)
    .subscribe(leaderboard => {
      let qualifies = false;
      if (leaderboard.length < 10) {
        qualifies = true;
      } else {
        const minScore = Math.min(...leaderboard.map(s => s.score));
        qualifies = this.score > minScore;
      }
      this.newHighScoreMsg = qualifies ? '¡Nuevo puntaje más alto!' : '';
    });
  this.showAlert('info', 'Juego finalizado');
}

  stopGame(): void {
    this.endGame();
  }

  saveScore(): void {
    const playerName = this.userSessionService.getUserEmail() || 'Jugador';
    const scoreData: Score = {
      name: playerName,
      score: this.score,
      date: new Date().toLocaleDateString(),
      game: 'Ahorcado'
    };
    this.gameScoreService
      .addScore(scoreData)
      .then(() => console.log('Score saved successfully'))
      .catch((error: any) => console.error('Error saving score', error));
  }

  showAlert(type: 'success' | 'error' | 'info', message: string) {
    this.retroType = type;
    this.retroMessage = message;
    this.showRetroAlert = true;
    setTimeout(() => {
      this.showRetroAlert = false;
    }, 3000);
  }
}
