import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { UserSessionService } from '../../core/services/user-session.service'; // Importar el servicio
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { GameScoreService } from '../../core/services/game-score.service';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  userName: string | null = null;
  games = ['Ahorcado', 'Preguntados', 'Mayor o Menor', 'Buscaminas'];
  constructor(
    private userSession: UserSessionService,
    private router: Router,
    private scoreService: GameScoreService
  ) {}

  ngOnInit() {
    this.userName = this.userSession.getUserName() ?? 'Anónimo';
    this.renderChart();
  }

  navigateToGame(ruta: string) {
    this.router.navigate([`/juegos/${ruta}`]);
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }

  goToSettings() {
    this.router.navigate(['/configuracion']);
  }
  async renderChart() {
    const stats = await this.scoreService.getGamesPlayCounts(this.games);
    const labels = stats.map((s) => s.game);
    const data = stats.map((s) => s.count);

    const chartConfig: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Partidas registradas',
            data,
            backgroundColor: 'rgba(0, 255, 0, 0.5)',
            borderColor: 'lime',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    new Chart('gameChart', chartConfig);
  }
}
