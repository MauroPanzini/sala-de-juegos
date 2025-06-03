import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  collection,
  addDoc,
} from '@angular/fire/firestore';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class AuthComponent {
  isLogin = true;
  isAdmin = false;
  loginForm: FormGroup;
  email = '';
  password = '';
  submitted = false;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  private userSession = inject(UserSessionService);

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  showLogin() {
    this.isLogin = true;
  }

  showRegister() {
    this.isLogin = false;
  }

  fillAdminCredentials() {
    this.loginForm.patchValue({
      username: 'admin@admin.com',
      password: 'admin123',
    });
  }

  async onLogin() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.snackBar.open(
        'Debe ingresar un correo válido y una contraseña.',
        'Cerrar',
        {
          duration: 3000,
          verticalPosition: 'top',
        }
      );
      return;
    }

    if (this.loginForm.invalid) return;

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        username,
        password
      );

      this.userSession.setUserEmail(username);
      const userId = userCredential.user.uid;
      const email = userCredential.user.email;
      const now = new Date();

      await setDoc(
        doc(this.firestore, 'users', userId),
        {
          email,
          lastLogin: now,
        },
        { merge: true }
      );

      const loginRef = collection(this.firestore, `users/${userId}/logins`);
      await addDoc(loginRef, {
        email,
        timestamp: now,
      });

      this.isAdmin = username === 'admin@admin.com';
      this.router.navigate(['/inicio']);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.snackBar.open(
        'Credenciales inválidas o error en el login',
        'Cerrar',
        {
          duration: 4000,
          verticalPosition: 'top',
        }
      );
    }
  }

  async onRegister() {
    this.submitted = true;

    if (!this.isValidEmail(this.email)) {
      this.snackBar.open('El correo ingresado no es válido.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    if (this.password.length < 6) {
      this.snackBar.open(
        'La contraseña debe tener al menos 6 caracteres.',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      this.userSession.setUserEmail(this.email);

      const userId = userCredential.user.uid;
      const now = new Date();

      await setDoc(doc(this.firestore, 'users', userId), {
        email: this.email,
        createdAt: now,
        lastLogin: now,
      });

      const loginRef = collection(this.firestore, `users/${userId}/logins`);
      await addDoc(loginRef, {
        email: this.email,
        timestamp: now,
      });

      this.snackBar.open('Registro exitoso. ¡Bienvenido!', 'Cerrar', {
        duration: 3000,
      });

      this.router.navigate(['/inicio']);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.snackBar.open('El correo ya está registrado.', 'Cerrar', {
          duration: 3000,
        });
      } else {
        console.error('Error en el registro:', error);
        this.snackBar.open('Ocurrió un error durante el registro.', 'Cerrar', {
          duration: 3000,
        });
      }
    }
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(emailPattern.test(email));
    return emailPattern.test(email);
  }
}
