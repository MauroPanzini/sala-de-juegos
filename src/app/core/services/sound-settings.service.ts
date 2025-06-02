import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserSessionService } from './user-session.service';

@Injectable({ providedIn: 'root' })
export class SoundSettingsService {
  private uxSoundEnabled$ = new BehaviorSubject<boolean>(true);
  private musicEnabled$ = new BehaviorSubject<boolean>(true);

  constructor(private session: UserSessionService) {
    this.uxSoundEnabled$.next(this.session.getUXPreferences());
    this.musicEnabled$.next(this.session.getMusicPreferences());
  }

  isUXSoundEnabled() {
    return this.uxSoundEnabled$.asObservable();
  }

  isMusicEnabled() {
    return this.musicEnabled$.asObservable();
  }

  isMusicEnabledValue(): boolean {
    return this.musicEnabled$.value;
  }

  isUXEnabledValue(): boolean {
    return this.uxSoundEnabled$.value;
  }

  toggleUXSound(): void {
    const value = !this.uxSoundEnabled$.value;
    this.uxSoundEnabled$.next(value);
    this.session.setUXPreferences(value);
  }

  toggleMusic(): void {
    const value = !this.musicEnabled$.value;
    this.musicEnabled$.next(value);
    this.session.setMusicPreferences(value);
  }
}