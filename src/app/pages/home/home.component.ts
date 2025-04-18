import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { UserSessionService } from '../../services/user-session.service'; // Importar el servicio

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  showFiller = false;
  userName: string | null = null;

  constructor(private userSession: UserSessionService) {}

  ngOnInit() {
    this.userName = this.userSession.getUserName() ?? 'Anónimo';
  }
}
