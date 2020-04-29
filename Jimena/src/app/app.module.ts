import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule }    from '@angular/common/http';  //importo funcionalidades de httpCLient
import { FormsModule }   from '@angular/forms'; // facilita la interacción con formularios

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
import { MenuUsuariosComponent } from './menu-usuarios/menu-usuarios.component';
import { NuevaAnotacionComponent } from './nueva-anotacion/nueva-anotacion.component';
import { MisAnotacionesComponent } from './mis-anotaciones/mis-anotaciones.component';
import { BusquedaComponent } from './busqueda/busqueda.component';
import { AjustesComponent } from './ajustes/ajustes.component';
import { MiAnotInfoComponent } from './mi-anot-info/mi-anot-info.component';
import { ComunidadComponent } from './comunidad/comunidad.component';
import { ValidarComponent } from './validar/validar.component';
import { ConfirmAnotComponent } from './confirm-anot/confirm-anot.component';
import { RegistroAnotComponent } from './registro-anot/registro-anot.component';
import { MensajesComponent } from './mensajes/mensajes.component';
import { ArbolComponent } from './arbol/arbol.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { ContactoComponent } from './contacto/contacto.component';
import { ListaComponent } from './lista/lista.component';
import { ListaCompletaComponent } from './lista-completa/lista-completa.component';

const routes: Routes = [ 
  { path: 'inicio_sesion', component: IniciarSesionComponent },
  { path: 'reg-anot', component: RegistroAnotComponent },
  { path: 'confirm', component: ConfirmAnotComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'nuevaAnot', component: NuevaAnotacionComponent },
  { path: 'validar', component: ValidarComponent },
  { path: 'comunidad', component: ComunidadComponent },
  { path: 'mi_info', component: MiAnotInfoComponent },
  { path: 'ajustes', component: AjustesComponent },
  { path: 'busqueda', component: BusquedaComponent },
  { path: 'mis_anot', component: MisAnotacionesComponent },
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
    PrincipalComponent,
    MenuUsuariosComponent,
    NuevaAnotacionComponent,
    MisAnotacionesComponent,
    BusquedaComponent,
    AjustesComponent,
    MiAnotInfoComponent,
    ComunidadComponent,
    ValidarComponent,
    ConfirmAnotComponent,
    RegistroAnotComponent,
    MensajesComponent,
    ArbolComponent,
    NosotrosComponent,
    ContactoComponent,
    ListaComponent,
    ListaCompletaComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
