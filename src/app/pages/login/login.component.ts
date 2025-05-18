import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, addDoc } from '@angular/fire/firestore';
import { UserSessionService } from '../../core/services/user-session.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userSession: UserSessionService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, username, password);

      this.userSession.setUserEmail(username);

      const userId = userCredential.user.uid;
      const email = userCredential.user.email;
      const now = new Date();

      await setDoc(
        doc(this.firestore, 'users', userId),
        {
          email: email,
          lastLogin: now
        },
        { merge: true }
      );

      const loginRef = collection(this.firestore, `users/${userId}/logins`);
      await addDoc(loginRef, {
        email: email,
        timestamp: now
      });

      this.router.navigate(['/inicio']);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.snackBar.open('Credenciales inválidas o error en el login', 'Cerrar', {
        duration: 4000,
        verticalPosition: 'top',
      });
    }
  }

  fillAdminCredentials() {
    this.loginForm.patchValue({
      username: 'admin@admin.com',
      password: 'admin123'
    });
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }
}
