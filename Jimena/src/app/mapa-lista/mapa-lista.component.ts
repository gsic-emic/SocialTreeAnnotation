/*                            MapaListaComponent
    Componente que muestra el mapa con los árboles que hay en la zona por la que se navega. También muestra
    en forma de lista los árboles que haya cargados en esa zona.
*/
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mapa-lista',
  templateUrl: './mapa-lista.component.html',
  styleUrls: ['./mapa-lista.component.css']
})
export class MapaListaComponent implements OnInit {

  @Input() objSpecies: object=[]; // Le llega del componente de inicio
  //-----------------------------
  public mapa: boolean = true; // Controla si se ve el mapa o la lista
  //-----------------------------

  constructor() { }

  ngOnInit(): void {
  }

}
