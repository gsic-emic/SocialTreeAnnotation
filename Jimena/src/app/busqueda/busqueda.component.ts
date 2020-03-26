import { Component, OnInit } from '@angular/core';
import { ArbolService } from '../arbol.service'
import { Arbol } from '../arbol';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {

  arboles: Arbol[]; /* Array que contiene los árboles que hay almacenados en el sistema */
  submitted = false;
  arbol_selected: Arbol;
  validar = false;

  constructor(private arbolService: ArbolService) { }

  ngOnInit(): void {
    this.getArboles();
  }

  /* Método para recuperar los árboles del servicio */
  getArboles(): void {
    this.arboles = this.arbolService.getArboles();
  }

  onSubmit() { 
    this.submitted = true; 
  }

  obtenerIdSelecionado(id: string){
    this.arbol_selected = this.arboles[id];
  }
  obtenerIdSelecionado_validar(id: string){
    this.arbol_selected = this.arboles[id];
    this.validar = true;
  }

}
