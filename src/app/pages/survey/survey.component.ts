import { Component, inject } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    MatSnackBarModule
  ],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss',
})
export class SurveyComponent {
  encuestaForm: FormGroup;
  user = "Anónimo";
  private snackBar = inject(MatSnackBar);
  constructor(private fb: FormBuilder,  private firestore: Firestore, private userSession: UserSessionService) {
    this.encuestaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(18), Validators.max(99),Validators.pattern(/^\d{1,10}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      juegoFavorito: ['', Validators.required],
      usaPlay: [false],
      usaXbox: [false],
      usaPc: [false],
      preferencia: ['', Validators.required],
    });
    
  }

  async onSubmit() {
    if (this.encuestaForm.valid) {
      const datos = this.encuestaForm.value;

      this.user = this.userSession.getUserName() ?? 'Anónimo';
  
      const encuestasRef = collection(this.firestore, 'encuestas');
  
      await addDoc(encuestasRef, {
        nombreUsuario:this.userSession.getUserEmail(),
        ...datos,
        fecha: new Date(),
      });
  
      this.snackBar.open('Encuesta enviada correctamente!', 'Cerrar', {
        duration: 3000
      });
  
      this.encuestaForm.reset();
    }
  }
  
}
