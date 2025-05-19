import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  private readonly USER_EMAIL_KEY = 'userEmail';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setUserEmail(email: string): void {
    if (this.isBrowser()) {
      sessionStorage.setItem(this.USER_EMAIL_KEY, email);
    }
  }

  getUserEmail(): string | null {
    if (this.isBrowser()) {
      return sessionStorage.getItem(this.USER_EMAIL_KEY);
    }
    return null;
  }

  getUserName(): string | null {
    const email = this.getUserEmail();
    return email ? email.split('@')[0] : null;
  }

  clear(): void {
    if (this.isBrowser()) {
      sessionStorage.clear();
    }
  }
  private readonly USER_AVATAR_KEY = 'userAvatar';

  setUserAvatar(url: string): void {
    if (this.isBrowser()) {
      sessionStorage.setItem(this.USER_AVATAR_KEY, url);
    }
  }

  getUserAvatar(): string | null {
    if (this.isBrowser()) {
      return sessionStorage.getItem(this.USER_AVATAR_KEY);
    }
    return null;
  }
  isLoggedIn(): boolean {
  return this.isBrowser() && sessionStorage.getItem(this.USER_EMAIL_KEY) !== null;
}
}
