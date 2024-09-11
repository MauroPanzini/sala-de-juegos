import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';  // Asegúrate de importar las rutas correctamente
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)  // Provee el sistema de rutas
  ]
}).catch(err => console.error(err));
