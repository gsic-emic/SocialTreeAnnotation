import { Component, OnInit } from '@angular/core';
import { ArbolService } from '../arbol.service'
import { Arbol } from '../arbol';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(private arbolService: ArbolService) { }

  ngOnInit(): void {
    this.getArboles();
 }

  /* Variables utilizadas en el html */
  mapa: boolean = true;
  arboles: Arbol[]; /* Array que contiene los árboles que hay almacenados en el sistema */
  submitted = false;
  arbol_selected: Arbol;


  /* Método para recuperar los árboles del servicio */
  getArboles(): void {
    this.arboles = this.arbolService.getArboles();
  }

  obtenerIdSelecionado(id: string){
    //console.log(id);
    this.arbol_selected = this.arboles[id];
  }

  onSubmit() { 
    this.submitted = true; 
  }


}
