import { Component, OnInit } from '@angular/core';
import { TriviaService } from '../../../core/services/trivia.service';
import { Question } from '../../../core/models/trivia.model';
import {
  GameScoreService,
  Score,
} from '../../../core/services/game-score.service';
import { UserSessionService } from '../../../core/services/user-session.service';
import { SoundService } from '../../../core/services/sound.service';
import { SoundSettingsService } from '../../../core/services/sound-settings.service';

@Component({
  selector: 'app-trivia',
  templateUrl: './trivia.component.html',
  styleUrls: ['./trivia.component.scss'],
})
export class TriviaComponent implements OnInit {
  questions: Question[] = [];
  currentIndex = 0;
  currentQuestion!: Question;
  score = 0;
  gameOver = false;
  gameStarted = false;

  timer!: number;
  timerInterval!: any;
  errors: number = 0;
  MAX_ERRORS = 3;
  MAX_TIME = 10;

  selectedAnswer: string | null = null;
  showFeedback = false;
  highScore = 0;
  newHighScoreMsg = '';

  constructor(
    private triviaService: TriviaService,
    private gameScoreService: GameScoreService,
    private userSessionService: UserSessionService,
    private soundService: SoundService,
    private soundSettings: SoundSettingsService
  ) {}

  ngOnInit(): void {
    const savedScore = localStorage.getItem('triviaHighScore');
    if (savedScore) this.highScore = parseInt(savedScore, 10);
  }

  startGame() {
    this.score = 0;
    this.errors = 0;
    this.currentIndex = 0;
    this.gameOver = false;
    this.newHighScoreMsg = '';
    this.selectedAnswer = null;
    this.gameStarted = true;

    this.triviaService.getQuestions().subscribe((questions) => {
      this.questions = questions;
      this.currentQuestion = this.questions[this.currentIndex];
      this.startTimer();
    });
  }
  startTimer() {
    this.timer = this.MAX_TIME; 
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        clearInterval(this.timerInterval);
        this.handleTimeout();
      }
    }, 1000);
  }
  handleTimeout() {
    this.errors++; 
    if (this.errors >= this.MAX_ERRORS) {
      this.endGame();
    } else {
      this.nextQuestion(); 
    }
  }

  selectAnswer(answer: string) {
    if (this.selectedAnswer) return;

    clearInterval(this.timerInterval); 
    this.selectedAnswer = answer;
    this.showFeedback = true;

    if (answer === this.currentQuestion.correct_answer) {
      if(this.soundSettings.isUXEnabledValue()){
        this.soundService.play('accionPositiva');
      }
      this.score += this.timer;
    } else {
      if(this.soundSettings.isUXEnabledValue()){
        this.soundService.play('accionNegativa');
      }
      this.errors++; 
      if (this.errors >= this.MAX_ERRORS) {
        this.endGame();
        return;
      }
    }

    setTimeout(() => this.nextQuestion(), 1500);
  }

  nextQuestion() {
    this.selectedAnswer = null;
    this.showFeedback = false;
    this.currentIndex++;

    if (this.currentIndex >= this.questions.length) {
      this.endGame();
    } else {
      this.currentQuestion = this.questions[this.currentIndex];
      this.startTimer();
    }
  }

  endGame() {
    this.gameOver = true;
    this.gameStarted = false;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('triviaHighScore', this.highScore.toString());
    }

    this.saveScore();

    this.gameScoreService
      .getLeaderboard('Preguntados', 10)
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
      game: 'Preguntados',
    };
    this.gameScoreService
      .addScore(scoreData)
      .then(() => console.log('Score saved successfully'))
      .catch((error: any) => console.error('Error saving score', error));
  }

  restartGame() {
    this.startGame();
  }
}
