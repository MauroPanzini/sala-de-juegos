import { Component, OnInit } from '@angular/core';
import { TriviaService } from '../../../core/services/trivia.service';
import { Question } from '../../../core/models/trivia.model';
import {
  GameScoreService,
  Score,
} from '../../../core/services/game-score.service';
import { UserSessionService } from '../../../core/services/user-session.service';

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

  timer!: number; // Segundos restantes
  timerInterval!: any; // Referencia al intervalo
  errors: number = 0; // Contador de errores
  MAX_ERRORS = 3; // Límite de errores
  MAX_TIME = 10; // Tiempo máximo por pregunta

  selectedAnswer: string | null = null;
  showFeedback = false;
  highScore = 0;
  newHighScoreMsg = '';

  constructor(
    private triviaService: TriviaService,
    private gameScoreService: GameScoreService,
    private userSessionService: UserSessionService
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
    this.timer = this.MAX_TIME; // Reseteamos el tiempo a 10 seg
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        clearInterval(this.timerInterval);
        this.handleTimeout();
      }
    }, 1000);
  }
  handleTimeout() {
    this.errors++; // Incrementa el contador de errores
    if (this.errors >= this.MAX_ERRORS) {
      this.endGame(); // Termina el juego si se supera el límite
    } else {
      this.nextQuestion(); // Pasa a la siguiente pregunta
    }
  }

  selectAnswer(answer: string) {
    if (this.selectedAnswer) return;

    clearInterval(this.timerInterval); // Detener el temporizador
    this.selectedAnswer = answer;
    this.showFeedback = true;

    if (answer === this.currentQuestion.correct_answer) {
      this.score += this.timer; 
    } else {
      this.errors++; // Sumar error si falla
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

    // Guardar el score
    this.saveScore();

    // Verificar si es nuevo high score en el top 10
    this.gameScoreService
      .getLeaderboard('Preguntados', 10)
      .subscribe((leaderboard) => {
        let qualifies = false;
        if (leaderboard.length < 10) {
          qualifies = true;
        } else {
          const minScore = Math.min(...leaderboard.map((s) => s.score));
          qualifies = this.score >= minScore;
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
