import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';  // Asegúrate de importar las rutas correctamente
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../src/environments/environment'; // Importa la configuración desde environment
import { UserSessionService } from './app/services/user-session.service'; // Asegúrate de importar tu servicio
import { SurveyComponent } from './app/pages/survey/survey.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Usa la configuración desde environment
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    UserSessionService, // Agrega tu servicio aquí para que esté disponible globalmente
    SurveyComponent
  ]
}).catch(err => console.error(err));
