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
import { NuevoArbolComponent } from './nuevo-arbol/nuevo-arbol.component';
import { MisAnotacionesComponent } from './mis-anotaciones/mis-anotaciones.component';
import { BusquedaComponent } from './busqueda/busqueda.component';
import { AjustesComponent } from './ajustes/ajustes.component';
import { ComunidadComponent } from './comunidad/comunidad.component';
import { ConfirmAnotComponent } from './confirm-anot/confirm-anot.component';
import { RegistroAnotComponent } from './registro-anot/registro-anot.component';
import { ArbolComponent } from './arbol/arbol.component';
import { BuscadorComponent } from './buscador/buscador.component';
import { ContactoComponent } from './contacto/contacto.component';
import { ListaComponent } from './lista/lista.component';
import { AddAnnotComponent } from './add-annot/add-annot.component';
import { MilistaComponent } from './milista/milista.component';
import { MilistaAnnotComponent } from './milista-annot/milista-annot.component';
import { MapaUsuariosComponent } from './mapa-usuarios/mapa-usuarios.component';
import { MapaListaComponent } from './mapa-lista/mapa-lista.component';

const routes: Routes = [ 
  { path: 'inicio_sesion', component: IniciarSesionComponent },
  { path: 'reg-anot', component: RegistroAnotComponent },
  { path: 'confirm', component: ConfirmAnotComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'buscador', component: BuscadorComponent },
  { path: 'nuevo_arbol', component: NuevoArbolComponent },
  { path: 'comunidad', component: ComunidadComponent },
  { path: 'ajustes', component: AjustesComponent },
  { path: 'busqueda', component: BusquedaComponent },
  { path: 'mapa', component: MapaUsuariosComponent },
  { path: 'mis_anot', component: MisAnotacionesComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'principal', component: PrincipalComponent },
  { path: 'nuevaAnnot', component: AddAnnotComponent },
  { path: 'info_anotacion', component: AddAnnotComponent },
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
    NuevoArbolComponent,
    MisAnotacionesComponent,
    BusquedaComponent,
    AjustesComponent,
    ComunidadComponent,
    ConfirmAnotComponent,
    RegistroAnotComponent,
    ArbolComponent,
    BuscadorComponent,
    ContactoComponent,
    ListaComponent,
    AddAnnotComponent,
    MilistaComponent,
    MilistaAnnotComponent,
    MapaUsuariosComponent,
    MapaListaComponent
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
