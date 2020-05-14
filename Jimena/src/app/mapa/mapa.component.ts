import { Component, OnInit, Input } from '@angular/core';
import {Tree} from '.././tree';


declare let L;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada desde la lista completa

  constructor() { }

  ngOnInit(): void { /*se ejecuta en cuanto angular tenga listo el componente*/
    /* Creación del objeto mapa y su capa de diseño */
    var mymap = this.crearMapa(41.763, -5.1093, 13); /* mapa centrado en españa */
    var layer = this.crearLayer_gray();
    layer.addTo(mymap);

    if (!this.trees){
      this.cargando = true;
    }

    /* Añado los marcadores de los árboles registrados */
    var treeIcon = this.crearIcono();
    for (var i = 0; i <= this.trees.length; i++) {
      L.marker([this.trees[i].lat, this.trees[i].long], {icon: treeIcon}).addTo(mymap).bindPopup("Creado por: " + this.trees[i].creator +"\n" +this.trees[i].species);
   }
   
  }
  public cargando: boolean = false;

  /* Creación del objeto mapa*/
  crearMapa (lat:number, long:number, zoom:number){
    var mymap = L.map('mapid').setView([lat, long], zoom); /* creo el objeto mymap */
    return mymap;
  }

  /* Creación de las capas del mapa */
  crearLayer_gray(){
    var grayscale = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        minZoom: 5,
	      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
      });
    return grayscale;
  }

  crearLayer_streets(){
    var streets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      minZoom: 5,    
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });
    return streets;
  }

  /* MARCADORES */
  crearIcono(){
    var treeIcon = L.icon({
      iconUrl: './../assets/icons/pino.png',
      shadowUrl: './../assets/icons/sombra.png',
      iconSize:     [50, 50], // size of the icon
      shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [4, 50],  // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62],  // the same for the shadow
      popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  return treeIcon;
}
  /* Función que crea una variable para añadir un marker en la latitud y longitud especificadas */
  addMarker(latitud:number, longitud:number) {
    var marker = L.marker([latitud, longitud]);
    return marker;
  }

  /* Función que crea una variable para añadir un circulo en la latitud y longitud especificadas */
  addCircleGreen (latitud:number, longitud:number){
    var circle = L.circle([latitud, longitud], {
     color: 'green',
     fillColor: '#088A08',
     fillOpacity: 0.35,
     radius: 500
    });
    return circle;
  }
}