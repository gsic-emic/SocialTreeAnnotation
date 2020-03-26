import { Component, OnInit } from '@angular/core';
import { ArbolService } from '../arbol.service'
import { Arbol } from '../arbol';

@Component({
  selector: 'app-mis-anotaciones',
  templateUrl: './mis-anotaciones.component.html',
  styleUrls: ['./mis-anotaciones.component.css']
})
export class MisAnotacionesComponent implements OnInit {

  arboles: Arbol[];
  misArboles: Arbol[]; /* Array que contiene los árboles que hay almacenados en el sistema */
  existen: Boolean = true;
  usuario: String = "Jimena";
  num: Number = 0;

  constructor(private arbolService: ArbolService) { }

  ngOnInit(): void {
    
    //this.getMisArboles();
    
    if (!this.misArboles){
      this.existen = false;
    }
    console.log("Existen " + this.num);
  }

  /* REVISAR ESTA FUNCIÓN... CREO QUE ES TEMA DE LA FUNCIÓN DECLARADA EN EL SERVICIO*/
  getMisArboles(): void {
    this.misArboles = this.arbolService.getUserTrees(this.usuario);
  }
  

}
