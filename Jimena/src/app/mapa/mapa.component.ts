/*                            MapaComponent
     Componente que carga los árboles en función de las coordenadas del mapa y los pinta en el mismo
*/
import { Component, OnInit, Input } from '@angular/core';
//------------------------------------------------------
import {Tree} from '.././tree';
//----------------- SERVICES ---------------------------
import {APIService} from '../api.service';
import { TreeService } from '../services/tree.service';


declare let L;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  @Input() objSpecies; // Las especies se cargan en el componente padre
  @Input() mapa;
  //-----------------------------
  
  public muestra_info: boolean = false;
  public movido: boolean = false;

   // Creación del objeto mapa
  public mymap;// mapa centrado en españa 

  // Variables para la comunicacion con la API ----------------------------------
  public objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  public trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  public error: boolean = false;
  public terminado: boolean = false;
  public buscadorUri: string = "uri";
  public nohay: boolean = false;
  public ver: boolean = false;

  // Coordenadas del area que abarca el mapa en cada momento
  public lat0: number;
  public long0: number;
  public lat1: number;
  public long1: number;

  constructor(private api: APIService, private TreeService: TreeService) { }

  ngOnInit(): void { /*se ejecuta en cuanto angular tenga listo el componente*/

    /* Creación del objeto mapa y su capa de diseño */
    this.mymap = this.crearMapa(41.69, -5.09, 13); // mapa centrado en españa 
    var layer = this.crearLayer_gray();
    layer.addTo(this.mymap);

    // Inluyo botón de localización con Leaflet (ver https://github.com/domoritz/leaflet-locatecontrol))
    L.control.locate({
      icon: 'fas fa-street-view',
      flyTo: true,
      showPopup: false,
      locateOptions: { maxZoom: 15, animate: true, duration: 1 },
      strings: {
        title: "Ver mi ubicación"
    }
    }).addTo(this.mymap);

    // Al iniciar la app, se carga el mapa donde está centrado
      var bounds = this.mymap.getBounds(); // Obtengo las coordenadas del area que abarca el mapa al cargarse
      this.lat1 = bounds._northEast.lat;
      this.long1 = bounds._northEast.lng;
      this.lat0 = bounds._southWest.lat;
      this.long0 = bounds._southWest.lng;
      //console.log(bounds);
    this.actualizarTrees(this.lat0, this.long0, this.lat1, this.long1);

    // DETECCIÓN DE CAMBIOS EN EL MAPA
    // Evento que detecta cuando el mapa ha dejado de moverse      
     this.mymap.on('moveend', () =>{
      this.terminado = false;
      this.nohay = false;
      var bounds = this.mymap.getBounds(); // Obtengo las coordenadas del nuevo area que abarca el mapa
      this.lat1 = bounds._northEast.lat;
      this.long1 = bounds._northEast.lng;
      this.lat0 = bounds._southWest.lat;
      this.long0 = bounds._southWest.lng;
      this.trees = []; // Borro los datos de los árboles que tenia guardados
      this.actualizarTrees(this.lat0, this.long0, this.lat1, this.long1); // almaceno los nuevos
      //console.log("Se ha movido el mapa");
     });

      /* // Listener para el botón de cada árbol
       var arbolClick = document.getElementById("treeButton"); 
       arbolClick.addEventListener("click", function(){console.log("Pinchado")}, false);*/
    

  }

  /**
   * mostrar_info
   */
  public mostrar_info() {
    this.muestra_info = true;
  }

//---------------- Funciones relacionadas con la obtencion de los arboles -------------------------------
  /**
   * actualizarTrees: devuelve el JSON con todos los árboles en la zona que muestra el mapa
   */
  public actualizarTrees(lat0: number, long0: number, lat1: number, long1: number) {
    this.api.getTreesZone(lat0, long0, lat1, long1).subscribe(
        (data: any) =>{
          if (data != null){
            this.objTrees = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
            //console.log(data.response);
            this.trees = this.TreeService.crearTrees(this.objTrees, this.objSpecies);
            //console.log(trees);
          }else{
            console.log("No hay árboles en la zona seleccionada");
            this.nohay = true;
          }
        },
        (error) =>{
          console.error(error); // si se ha producido algún error
          this.error = true;
          alert("Ha habido un error al intentar cargar los árboles del sistema. Por favor, inténtelo de nuevo más tarde o recargue la página");
          this.terminado = true;
        },
        () =>{
          this.terminado = true;
          console.log("se han cargado todos los arboles");
          this.pintarArboles(this.trees);
        }
        );
  }
  //----------------------------------------------------------
  

  
  //---------------- Funciones relacionadas con el mapa -----------------------------------------
  /**
   * crearMapa: crea el objeto mapa
   */
  public crearMapa(lat:number, long:number, zoom:number) {
    var mymap = L.map('mapid').setView([lat, long], zoom); /* creo el objeto mymap */
    return mymap;
  }

  /**
   * crearLayer_gray: Creación de las capas del mapa 
   */
  public crearLayer_gray() {
    var grayscale = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        maxZoom: 22,
        minZoom: 12,
	      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
      });
    return grayscale;
  }

  /*crearLayer_streets(){
    var streets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      minZoom: 5,    
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });
    return streets;
  }*/

  /* MARCADORES */
  /**
   * crearIcono
   */
  public crearIcono() {
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

  /**
   * addMarker: crea una variable para añadir un marker en la latitud y longitud especificadas
   */
  public addMarker(latitud:number, longitud:number) {
    var marker = L.marker([latitud, longitud]);
    return marker;
  }

  /**
   * pintarArboles: crea un icono para cada arbol cargado en el mapa
   */
  public pintarArboles(trees: Tree[]) {
    var treeIcon = this.crearIcono();
    
   for (let clave in trees){
    L.marker([trees[clave].lat, trees[clave].long], {icon: treeIcon}).
    addTo(this.mymap).bindPopup(
      '<h5 class="card-title"><i class="fab fa-pagelines"></i> '+trees[clave].species + 
      '</h5><h6 class="card-subtitle mb-2 text-muted"><i class="fas fa-user"></i> Creador: ' + trees[clave].creator 
      /*+'</p><button type="button" id="treeButton" (onclick)="verArbol('+ trees[clave] + ')"; class="btn btn-primary ml-4">Ver más</button>'*/);
   }
  }
 
 
}