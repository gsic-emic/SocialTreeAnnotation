// Elemento hijo de la lista de todos los árboles. Muestra uno de ellos
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import {Tree} from '.././tree';
import { Annotation } from '.././Annotation';
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

  private imageUrl: string;

  constructor(private UsersService: UsersService, private router: Router) { }

  ngOnInit(): void {

    console.log(this.annotations);
    console.log(this.tree.id);

    document.getElementById("mas").addEventListener("click", ()=>{
      // Guardo la url del árbol al que quiere añadir una nueva anotación en la sesión
      sessionStorage.setItem('urlTree', this.tree.id);
      
      //compruebo si el usuario tiene la sesión iniciada
      let username = this.UsersService.getSessionName();
      
      if(username == null){ // el usuario no está loggeado, le mando a que inicie sesión
        this.router.navigate(['/inicio_sesion']);
      }else{
        // El usuario si que está loggeado
        this.router.navigate(['/nuevaAnnot']);
      }
    });
 
  }
  //---------------------------------------

  /**
   * comprobarRegistro
   */
  public comprobarRegistro() {
    //compruebo si el usuario tiene la sesión iniciada
    let basicAuth = this.UsersService.getUserAutentication();
    console.log(basicAuth);
  }
  

}
