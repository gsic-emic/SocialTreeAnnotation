/*                            InfoAnotacionComponent
     Elemento hijo de del componente ListaComponent.
     Este componente se encarga de la vista de la información de un árbol
     Permite al usuario añadir una nueva anotación (si está registrado, si no lo está, le redirige al
     componente de iniciar sesión)
*/
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
//-----------------------------------------------------
import {Tree} from '.././tree';
import { Annotation } from '.././Annotation';
import { Image } from '../Image';
//----------------- SERVICES ---------------------------
import { UsersService } from '../services/users.service';


@Component({
  selector: 'app-info-anotacion',
  templateUrl: './info-anotacion.component.html',
  styleUrls: ['./info-anotacion.component.css']
})
export class InfoAnotacionComponent implements OnInit {

  @Input() tree: Tree; // El árbol que va a mostrar le llega como parámetro de entrada desde la lista completa
  @Input() annotations: Annotation[];
  @Input () IsPossitionAsserted: boolean;
  @Input() IsSpeciesAsserted: boolean;
  @Input() imageAnnotations: Image[];

  public imageUrl: string;

  public registrado: boolean = false;
  public mapa: boolean = false;

  constructor(private UsersService: UsersService, private router: Router) { }

  ngOnInit(): void {
    // Control de si el usuario está registrado para mostrar alertas de registro
    this.registrado = this.UsersService.comprobarLogIn();

    //console.log(this.annotations);

    document.getElementById("mas").addEventListener("click", ()=>{
      // Guardo la url del árbol al que quiere añadir una nueva anotación en la sesión
      sessionStorage.setItem('urlTree', this.tree.id);
    
      if(!this.UsersService.comprobarLogIn()){
        this.router.navigate(['/inicio_sesion']); // el usuario no está loggeado, le mando a que inicie sesión
      }else{
        // El usuario si que está loggeado
        this.router.navigate(['/nuevaAnnot']);
      }
    });
 
  }
  //---------------------------------------
  /**
   * activarMapa
   */
  public activarMapa() {
    this.mapa = true;
  }

}
