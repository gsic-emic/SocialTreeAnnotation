// Elemento hijo de la lista de todos los árboles. Muestra uno de ellos
import { Component, OnInit, Input } from '@angular/core';
import { Arbol } from '../arbol';

@Component({
  selector: 'app-info-anotacion',
  templateUrl: './info-anotacion.component.html',
  styleUrls: ['./info-anotacion.component.css']
})
export class InfoAnotacionComponent implements OnInit {

  @Input() arbol: Arbol; // El árbol que va a mostrar le llega como parámetro de entrada desde la listaa completa

  constructor() { }

  ngOnInit(): void {
  }

  /* Variables utilizadas en el html*/
  mostrar_estadisticas: boolean = false;

}
