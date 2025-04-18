import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule // 👈 IMPORTANTE
  ],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss',
})
export class SurveyComponent {
  encuestaForm: FormGroup;

  constructor(private fb: FormBuilder,  private firestore: Firestore) {
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
  
      const userId = 'alguna-id-de-usuario'; // o Firebase Auth si estás logueando usuarios
  
      const encuestasRef = collection(this.firestore, 'encuestas');
  
      await addDoc(encuestasRef, {
        userId,
        ...datos,
        fecha: new Date(),
      });
  
      alert('Encuesta enviada correctamente!');
      this.encuestaForm.reset();
    }
  }
}
