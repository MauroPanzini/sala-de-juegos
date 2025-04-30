import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // para mostrar mensajes
import { UserSessionService } from '../../services/user-session.service'; // tu servicio

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule 
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  email = '';
  password = '';
  submitted = false;

  private auth = inject(Auth);

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private userSession: UserSessionService
  ) {}

  async register() {
    this.submitted = true;

    if (this.password.length < 6) {
      this.snackBar.open('La contraseña debe tener al menos 6 caracteres.', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      // Guardar el email en sessionStorage
      this.userSession.setUserEmail(this.email);

      // Redirigir al inicio
      this.snackBar.open('Registro exitoso. ¡Bienvenido!', 'Cerrar', {
        duration: 3000
      });    
      this.router.navigate(['/inicio']);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.snackBar.open('El correo ya está registrado.', 'Cerrar', {
          duration: 3000
        });
      } else {
        this.snackBar.open('Ocurrió un error durante el registro.', 'Cerrar', {
          duration: 3000
        });
      }
      console.error('Error en el registro:', error);
    }
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  goToLogin() {
    
    this.router.navigate(['/iniciar-sesion']);
    
  }
  
}
