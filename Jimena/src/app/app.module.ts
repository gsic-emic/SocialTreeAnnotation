import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EncabezadoComponent } from './encabezado/encabezado.component';
import { FooterComponent } from './footer/footer.component';
import { InicioComponent } from './inicio/inicio.component';
import { IniciarSesionComponent } from './iniciar-sesion/iniciar-sesion.component';
import { MapaComponent } from './mapa/mapa.component';
import { InfoAnotacionComponent } from './info-anotacion/info-anotacion.component';
import { RegistroComponent } from './registro/registro.component';
import { MenuComponent } from './menu/menu.component';
import { PrincipalComponent } from './principal/principal.component';

const routes: Routes = [ 
  { path: 'inicio_sesion', component: IniciarSesionComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'principal', component: PrincipalComponent },
  { path: 'info_anotacion', component: InfoAnotacionComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }, /*ruta por defecto*/
  { path: '', component: InicioComponent, pathMatch: 'full'  },
];

@NgModule({
  declarations: [
    AppComponent,
    EncabezadoComponent,
    FooterComponent,
    InicioComponent,
    IniciarSesionComponent,
    MapaComponent,
    InfoAnotacionComponent,
    RegistroComponent,
    MenuComponent,
    PrincipalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
