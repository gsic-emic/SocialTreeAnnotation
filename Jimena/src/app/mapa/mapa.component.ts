import { Component, OnInit } from '@angular/core';

declare let L;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {


  constructor() { }

  ngOnInit(): void { /*se ejecuta en cuanto angular tenga listo el componente*/
    /* Creación del objeto mapa y su capa de diseño */
    var mymap = this.crearMapa(40.463, -3.749, 5.5); /* mapa centrado en españa */
    var layer = this.crearLayer_gray();
    layer.addTo(mymap);

    /*Marcadores en Valladolid 
    var marker = this.addMarker(41.646665, -4.729642);
    marker.addTo(mymap);
    var area = this.addCircleGreen(41.646665, -4.729642);
    area.addTo(mymap); */

    /* Marcador personalizado */
    var treeIcon = this.crearIcono();
    L.marker([41.646665, -4.729642], {icon: treeIcon}).addTo(mymap);
    L.marker([41.7, -3.729642], {icon: treeIcon}).addTo(mymap);
    L.marker([42.352, -3.729642], {icon: treeIcon}).addTo(mymap);


  }

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
      //iconAnchor:   [4, 50],  // point of the icon which will correspond to marker's location
      //shadowAnchor: [4, 62],  // the same for the shadow
      //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
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