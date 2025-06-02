import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SoundSettingsService } from './sound-settings.service';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private isBrowser: boolean;
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private backgroundMusic?: HTMLAudioElement;

  constructor(
    private settings: SoundSettingsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (!this.isBrowser) return; // Solo ejecutamos lo siguiente en el navegador

    this.loadSound('BackgroundMusic', 'assets/sounds/OpeningMusic.mp3');
    this.loadSound('accionNegativa', 'assets/sounds/action-negative.mp3');
    this.loadSound('accesoDenegado', 'assets/sounds/acceso-denegado.mp3');
    this.loadSound('explosion', 'assets/sounds/explosion-minesweeper.mp3');
    this.loadSound('flag', 'assets/sounds/flag.mp3');
    this.loadSound('accionPositiva', 'assets/sounds/action-positive.mp3');

    this.backgroundMusic = this.sounds['BackgroundMusic'];
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.5;

    this.settings.isMusicEnabled().subscribe((enabled) => {
      if (enabled) {
        this.playBackgroundMusic();
      } else {
        this.pauseBackgroundMusic();
      }
    });
  }

  private loadSound(name: string, path: string) {
    if (!this.isBrowser) return;

    const audio = new Audio(path);
    audio.load();
    this.sounds[name] = audio;
  }

  play(name: string) {
    if (!this.isBrowser) return;

    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound
        .play()
        .catch((err) =>
          console.warn(`Error al reproducir sonido "${name}":`, err)
        );
    }
  }

  stop(name: string) {
    if (!this.isBrowser) return;

    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
    }
  }

  private playBackgroundMusic() {
    if (!this.isBrowser || !this.backgroundMusic) return;

    this.backgroundMusic
      .play()
      .catch((err) =>
        console.warn('No se pudo reproducir música de fondo:', err)
      );
  }

  private pauseBackgroundMusic() {
    if (!this.isBrowser || !this.backgroundMusic) return;

    this.backgroundMusic.pause();
  }

  setVolume(volume: number) {
    for (const sound of Object.values(this.sounds)) {
      sound.volume = volume;
    }
  }

  getVolume(): number {
    return this.backgroundMusic?.volume ?? 0.5;
  }
}
