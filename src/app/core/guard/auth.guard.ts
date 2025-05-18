import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserSessionService } from '../services/user-session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private userSession: UserSessionService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(): boolean | UrlTree {
    const isLoggedIn = this.userSession.isLoggedIn();
    if (isLoggedIn) {
      return true;
    } else {
      this.snackBar.open('Debes iniciar sesión para jugar.', 'Cerrar', {
        duration: 3000, // milisegundos
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['retro-snackbar'] // opcional para aplicar tu propio estilo
      });
      return this.router.parseUrl('/login');
    }
  }
}
