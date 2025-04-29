import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { UserSessionService } from '../../services/user-session.service';
import { inject } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';

export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  collapsed = signal(false);
  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '200px'));
  private auth = inject(Auth);

  // Usuario
  userEmail = signal<string | null>(null);
  userName = signal<string | null>(null);

  // Menu items
  menuItems = signal<MenuItem[]>([
    { icon: 'home', label: 'Inicio', route: 'inicio' },
    { icon: 'sports_esports', label: 'Juegos', route: 'juegos' },
    { icon: 'chat', label: 'Chat', route: 'chat' },
    { icon: 'bar_chart', label: 'Estadísticas', route: 'estadisticas' },
    { icon: 'mood', label: 'Encuesta', route: 'encuesta' },
    { icon: 'info', label: 'Sobre mi', route: 'sobre-mi' }
  ]);

  constructor(private router: Router, private userSession: UserSessionService) {
    const email = this.userSession.getUserEmail(); 
    const name = this.userSession.getUserName();  
    if (email) {
      this.userEmail.set(email);
      this.userName.set(email.split('@')[0]); // Extraer el nombre hasta el '@'

      // Agregar el botón "Salir"
      this.menuItems.update(items => [
        ...items,
        { icon: 'logout', label: 'Salir' }
      ]);
    } else {
      // Si no hay usuario, agregar el botón "Ingresar"
      this.menuItems.update(items => [
        ...items,
        { icon: 'login', label: 'Ingresar', route: 'iniciar-sesion' }
      ]);
    }
  }

  async onLogout() {
    try {
      await signOut(this.auth); // Cierra la sesión de Firebase
      this.userSession.clear(); // Limpia el almacenamiento local
      this.router.navigate(['/inicio']);
      window.location.reload(); // Reinicia la app para limpiar estado visual
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
  
  mainMenuItems = computed(() =>
    this.menuItems().filter(item => item.label !== 'Salir' && item.label !== 'Ingresar')
  );
  
  bottomMenuItems = computed(() =>
    this.menuItems().filter(item => item.label === 'Salir' || item.label === 'Ingresar')
  );
  
}
