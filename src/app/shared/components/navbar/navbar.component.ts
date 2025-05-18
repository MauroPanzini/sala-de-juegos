import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { UserSessionService } from '../../../core/services/user-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private auth = inject(Auth);
  userEmail = signal<string | null>(null);
  userName = signal<string | null>(null);

  menuItems = signal([
    { label: 'Inicio', route: '/inicio' },
    { label: 'Juegos', route: '/juegos' },
    { label: 'Chat', route: '/chat' },
    { label: 'Estadísticas', route: '/estadisticas' },
    { label: 'Encuesta', route: '/encuesta' },
    { label: 'Sobre mí', route: '/sobre-mi' },
  ]);

  avatarUrls: string[] = [
    '../../assets/avatars/avatar1.png',
    '../../assets/avatars/avatar2.png',
    '../../assets/avatars/avatar3.png',
    '../../assets/avatars/avatar4.png',
    '../../assets/avatars/avatar5.png',
    '../../assets/avatars/avatar6.png'
  ];

  selectedAvatar: string = '';

  bottomItems = signal<{ label: string; route?: string }[]>([]);

  constructor(private router: Router, private userSession: UserSessionService) {
    const email = this.userSession.getUserEmail();
    const name = this.userSession.getUserName();

    if (email) {
      this.userEmail.set(email);
      this.userName.set(name ?? email.split('@')[0]);

      this.bottomItems.set([
        { label: 'Salir', route: '/inicio' }
      ]);
    } else {
      this.userName.set('Anonimo');

      this.bottomItems.set([
        { label: 'Ingresar', route: '/iniciar-sesion' }
      ]);
    }
  }

  ngOnInit() {
    const currentUserName = this.userName();

    const existingAvatar = this.userSession.getUserAvatar();

    if (currentUserName === 'admin') {
      this.selectedAvatar = this.avatarUrls[1];
      this.userSession.setUserAvatar(this.selectedAvatar);
    } else if (existingAvatar) {
      this.selectedAvatar = existingAvatar;
    } else {
      const randomIndex = Math.floor(Math.random() * this.avatarUrls.length);
      this.selectedAvatar = this.avatarUrls[randomIndex];
      this.userSession.setUserAvatar(this.selectedAvatar);
    }
  }

  async logout() {
    try {
      await signOut(this.auth); 
      this.userSession.clear(); 
      this.router.navigate(['/inicio']);
      window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
