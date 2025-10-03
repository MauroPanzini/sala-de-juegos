import { Component, OnInit } from '@angular/core';
import {
  GameScoreService,
  Score,
} from '../../../core/services/game-score.service';
import { UserSessionService } from '../../../core/services/user-session.service';
import { SoundService } from '../../../core/services/sound.service';
import { SoundSettingsService } from '../../../core/services/sound-settings.service';

type Cell = {
  revealed: boolean;
  mine: boolean;
  flag: boolean;
  question: boolean;
  adjacentMines: number;
};

@Component({
  selector: 'app-connect-four',
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss',
})
export class MinesweeperComponent implements OnInit {
  rows = 9;
  cols = 9;
  mineCount = 12;
  minesLeft = this.mineCount;
  board: Cell[][] = [];

  mode: 'reveal' | 'flag' | 'question' = 'reveal';
  maxScore = 1000;
  score = 0;
  timer = 0;
  intervalId: any;
  gameStarted = false;
  gameOver = false;
  newHighScoreMsg = '';
  constructor(
    private gameScoreService: GameScoreService,
    private userSessionService: UserSessionService,
    private soundService: SoundService,
    private soundSettings: SoundSettingsService
  ) {}

  ngOnInit(): void {
    this.resetGame();
  }

  startGame() {
    this.soundService.stop('explosion');
    this.resetGame();
    this.generateMines();
    this.calculateAdjacents();
    this.startTimer();
    this.gameStarted = true;
    this.newHighScoreMsg = '';
    this.score = 0;
  }

  resetGame() {
    this.board = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        revealed: false,
        mine: false,
        flag: false,
        question: false,
        adjacentMines: 0,
      }))
    );
    this.timer = 0;
    this.gameOver = false;
    clearInterval(this.intervalId);
    
  }

  changeMode(mode: 'reveal' | 'flag' | 'question') {
    this.mode = mode;
  }

  startTimer() {
    this.intervalId = setInterval(() => this.timer++, 1000);
  }

  generateMines() {
    let placed = 0;
    while (placed < this.mineCount) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      const cell = this.board[row][col];
      if (!cell.mine) {
        cell.mine = true;
        placed++;
      }
    }
  }

  calculateAdjacents() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.board[row][col].adjacentMines = this.countAdjacentMines(row, col);
      }
    }
  }

  countAdjacentMines(r: number, c: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (this.isInBounds(nr, nc) && this.board[nr][nc].mine) {
          count++;
        }
      }
    }
    return count;
  }

  isInBounds(r: number, c: number): boolean {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  onCellClick(row: number, col: number) {
    const cell = this.board[row][col];

    if (cell.revealed) return;

    if (this.mode === 'reveal') {
      if (cell.mine && !cell.flag) {
        this.revealAll();
        clearInterval(this.intervalId);
        this.endGame();
        return;
      }
      this.revealCell(row, col);
    } else if (this.mode === 'flag') {
      if(this.minesLeft == 0 && !cell.flag){
      }
      else{
        cell.flag = !cell.flag;
        cell.question = false;
        if (cell.flag) {
          this.minesLeft--;
          if(this.soundSettings.isUXEnabledValue()){
            this.soundService.play('flag')
          }
        } else {
          this.minesLeft++;
        }
      }
    } else if (this.mode === 'question') {
      if (cell.question) {
        cell.question = false;
      } else {
        if (cell.flag) {
          this.minesLeft++;
        }
        cell.flag = false;
        cell.question = true;
      }
    }
  }

  revealCell(r: number, c: number) {
    if (!this.isInBounds(r, c)) return;
    const cell = this.board[r][c];
    if (cell.revealed || cell.flag) return;

    cell.revealed = true;

    if (!cell.mine) {
      this.score += 1;
    }

    if (cell.adjacentMines === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          this.revealCell(nr, nc);
        }
      }
    }

    this.checkWinCondition();
  }

  revealAll() {
  for (let row of this.board) {
    for (let cell of row) {
      cell.revealed = true;
      if (this.soundSettings.isUXEnabledValue() && cell.mine) {
        this.soundService.play('explosion');
      } 
    }
  }
}

onRightClick(event: MouseEvent, row: number, col: number) {
  event.preventDefault(); 
  const cell = this.board[row][col];

  if (cell.revealed) return;

  if (cell.flag) {
    cell.flag = false;
    cell.question = true;
    this.minesLeft++;
  } else if (cell.question) {
    cell.question = false;
  } else {
    if (this.minesLeft > 0) {
      cell.flag = true;
      if (this.soundSettings.isUXEnabledValue()) {
        this.soundService.play('flag');
      }
      this.minesLeft--;
    }
  }
}


  checkWinCondition() {
    let unrevealedCells = 0;

    for (let row of this.board) {
      for (let cell of row) {
        if (!cell.revealed && !cell.mine) {
          unrevealedCells++;
        }
      }
    }

    if (unrevealedCells === 0) {
      this.winGame();
    }
  }

  winGame() {
    this.score += 100;
    this.score += Math.round(this.maxScore / this.timer);
    this.endGame();
  }

  endGame() {
    this.gameOver = true;
    this.gameStarted = false;
    this.minesLeft = this.mineCount;
    let qualifies = false;
    this.saveScore();
    this.gameScoreService
      .getLeaderboard('Buscaminas', 10)
      .subscribe((leaderboard) => {
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
      game: 'Buscaminas',
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
