import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameScoreService, Score } from '../../core/services/game-score.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
  selectedGame: string = 'Buscaminas';
  games: string[] = ['Buscaminas', 'Ahorcado', 'Mayor o Menor', 'Preguntados'];
  topScores: Score[] = [];

  constructor(private scoreService: GameScoreService) {}

  ngOnInit(): void {
    this.loadScores();
  }

  loadScores(): void {
    this.scoreService.getLeaderboard(this.selectedGame).subscribe(scores => {
      this.topScores = scores;
      console.log(this.selectedGame, scores);
    });
  }

  onGameChange(): void {
    this.loadScores();
  }
}
