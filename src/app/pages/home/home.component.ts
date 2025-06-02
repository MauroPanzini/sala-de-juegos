import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { UserSessionService } from '../../core/services/user-session.service';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { GameScoreService } from '../../core/services/game-score.service';
import { SoundSettingsService } from '../../core/services/sound-settings.service';
import { SoundService } from '../../core/services/sound.service';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  uxSoundEnabled = true;
  musicEnabled = true;

  userName: string | null = null;
  games = ['Ahorcado', 'Preguntados', 'Mayor o Menor', 'Buscaminas'];

  fondos: string[] = [
    '../../../assets/backgrounds/background-gif1.gif',
    '../../../assets/backgrounds/salaDeJuegosLogin.gif',
    '../../../assets/backgrounds/background-gif3.gif',
  ];
  fondoSeleccionado: string = '';
  mostrarConfiguracion = false;
  volume = 0.5;
  constructor(
    private userSession: UserSessionService,
    private router: Router,
    private scoreService: GameScoreService,
    private soundService: SoundService,
    private soundSettings: SoundSettingsService
  ) {}

  ngOnInit() {
    this.volume = this.soundService.getVolume();
    this.uxSoundEnabled = this.soundSettings.isUXEnabledValue();
    this.musicEnabled = this.soundSettings.isMusicEnabledValue();
    this.userName = this.userSession.getUserName() ?? 'Anónimo';
    this.renderChart();

    const fondoGuardado = localStorage.getItem('fondoSeleccionado');
    if (fondoGuardado) {
      this.fondoSeleccionado = fondoGuardado;
      this.aplicarFondo(fondoGuardado);
    }
  }

  navigateToGame(ruta: string) {
    this.router.navigate([`/juegos/${ruta}`]);
  }

  goToChat() {
    this.router.navigate(['/chat']);
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
            backgroundColor: 'rgba(92, 178, 84, 0.5)',
            borderColor: 'rgba(92, 178, 84, 0.5)',
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

  toggleConfiguracion(): void {
    this.mostrarConfiguracion = !this.mostrarConfiguracion;
  }

  cambiarFondo(fondo: string): void {
    this.fondoSeleccionado = fondo;
    localStorage.setItem('fondoSeleccionado', fondo);
    this.aplicarFondo(fondo);
  }

  aplicarFondo(fondo: string): void {
    document.body.style.backgroundImage = `url('${fondo}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
  }
  quitarFondo(): void {
    this.fondoSeleccionado = '';
    localStorage.removeItem('fondoSeleccionado');
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundAttachment = '';
  }
  toggleUXSound(): void {
    this.soundSettings.toggleUXSound();
    this.uxSoundEnabled = this.soundSettings.isUXEnabledValue();
  }

  toggleMusic(): void {
    this.soundSettings.toggleMusic();
    this.musicEnabled = this.soundSettings.isMusicEnabledValue();

    if (this.musicEnabled) {
      this.soundService.play('BackgroundMusic');
    } else {
      this.soundService.stop('BackgroundMusic');
    }
  }
  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const volumeValue = parseFloat(input.value);
    this.volume = volumeValue;
    this.soundService.setVolume(volumeValue);
  }
}
