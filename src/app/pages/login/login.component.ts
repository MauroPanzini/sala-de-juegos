import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,  // Indica que este es un componente standalone
  imports: [ReactiveFormsModule, CommonModule]  // Importa los módulos necesarios
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.loginForm = this.formBuilder.group({
      username: [''],
      password: ['']
    });
  }

  onSubmit() {
    this.submitted = true;
    console.log("entre");
    if (this.loginForm.invalid) {
      console.log("entre2");
      return;
    }
    else
    this.router.navigate(['/home']);
    const { username, password } = this.loginForm.value;
    
    
    // if (username === 'admin' && password === 'admin123') {
    //   console.log("entre3");
    //   this.router.navigate(['/home']);
    // } else {
    //   alert('Invalid credentials');
    // }
  }
}
