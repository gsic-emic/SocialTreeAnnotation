/*                            MinimapaComponent
     Componente que carga un árbol en el mapa
*/
import { Component, OnInit, Input } from '@angular/core';
//------------------------------------------------------
import {Tree} from '.././tree';

declare let L;

@Component({
  selector: 'app-minimapa',
  templateUrl: './minimapa.component.html',
  styleUrls: ['./minimapa.component.css']
})
export class MinimapaComponent implements OnInit {

  @Input() tree: Tree; // info del árbol a mostrar

   // Creación del objeto mapa
   private mymap;// mapa centrado en el árbol
   private marker;

  constructor() { }

  ngOnInit(): void {
    /* Creación del objeto mapa y su capa de diseño */
    this.mymap = this.crearMapa(this.tree.lat, this.tree.long, 14);
    var layer = this.crearLayer_gray();
    layer.addTo(this.mymap);
  }

  /**
   * cargarMapa
   */
  public cargarMapa() {
    this.mymap.setView(new L.LatLng(this.tree.lat, this.tree.long), 14);
    var treeIcon = L.icon({
      iconUrl: './../assets/icons/pino.png',
      shadowUrl: './../assets/icons/sombra.png',
      iconSize:     [50, 50], // size of the icon
      shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [4, 50],  // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62],  // the same for the shadow
      popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

     this.marker = L.marker([this.tree.lat, this.tree.long], {icon: treeIcon}).addTo(this.mymap);
  }

   /**
   * crearMapa: crea el objeto mapa
   */
  public crearMapa(lat:number, long:number, zoom:number) {
    var mymap = L.map('map').setView([lat, long], zoom); /* creo el objeto mymap */
    return mymap;
  }

  /**
   * crearLayer_gray: Creación de las capas del mapa 
   */
  public crearLayer_gray() {  
    var grayscale = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 22,
        minZoom: 10,
	      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      });
    return grayscale;
  }


}
