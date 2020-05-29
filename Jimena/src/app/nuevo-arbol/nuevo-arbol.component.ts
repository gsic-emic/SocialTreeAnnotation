import { Component, OnInit } from '@angular/core';
import { Tree_complete } from '../tree_complete';
import { APIService} from '../api.service';
//import {EXIF as exifShim, EXIFStatic } from '../../../node_modules/exif-js/exif';

//declare var EXIF : EXIFStatic;

@Component({
  selector: 'app-nuevo-arbol',
  templateUrl: './nuevo-arbol.component.html',
  styleUrls: ['./nuevo-arbol.component.css']
})
export class NuevoArbolComponent implements OnInit {

  // ESPCIES **************************
  objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  ESPECIES: Array<string> = [];
  buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";
  buscadorUri: string = "uri";

  // Variables para recoger los datos del cuestionario
  newTree: Tree_complete;
  lat: number;
  long: number;
  especie: string;
  hoja: string;
  fruto: string;
  imagen: string;
  creador:string = "demo";
  fecha: string;
  

  //variables de control
  submitted: boolean = false;
  confirmacion: boolean = false;
  mensajeError: string;
  error: boolean = false; // controla especies
  terminado: boolean = false;
  terminado2: boolean = false; // controla creacion arboles
  error2: boolean = false;

  // Imágenes
  base64: string; // guarda la codificacion de la imagen
  title: string;
  description: string;
  PARTES: Array<string> = ["Parte del árbol", "Tronco", "Otra parte", "Hoja", "Vista general", "Fruto", "Flor", "Copa", "Rama"]
  depicts: string;
  metadata: Array<any>;
  date_img: string;
  lat_img: number;
  long_img: number;
  width: number;
  heigth: number;

  constructor(private api: APIService) { }

  ngOnInit(): void {
    this.getSpecies(); // cargo las especies disponibles para ponerlas en el formulario
  }


  // método que pasa a la página para confirmar la nueva anotación
  public onSubmit() { 
    this.submitted = true;
    this.fecha = this.construirFecha();
  }

  //acción que vuelve al formulario CON los datos que se han introducido
  volver(){
    this.submitted = false;
  }

  //método que borra los datos introducidos por el usuario y vuelve al formulacio de nueva anotación
  public borrarDatos(){
    this.lat = null;
    this.long = null;
    this.especie = null;
    this.imagen = null;
    this.title = null;
    this.description = null;
    this.depicts = null;
    this.error2 = null;

    this.volver();
    this.confirmacion = false;
  }

   // Cargo todas las especies disponibles del sistema
   getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
        this.cargarEspecies();
        //console.log(this.objSpecies);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar las especies del sistema. Inténtelo de nuevo más tarde");
        this.terminado = true;
      },
      () =>{  
        this.terminado = true;
      }
      );
  }
  cargarEspecies(){
    var i=0;
    for (let clave in this.objSpecies){     
      if (this.objSpecies[clave]["nivel"]== 0){ // Las especies son de nivel 0
        this.ESPECIES[i] = this.objSpecies[clave][this.buscadorSpecies]["lits"].es;
        i++;
      }
    }
  }
  
  //contstruyo el arbol, lo convierto a JSON y hago un POST a la api
  public createTree(){
    let si = false;
    
    // creo el campo depics para no tener que repetir codigo en los if
    if (this.depicts != null){
      // Creo el campo de depics
      switch (this.depicts){
        case "Parte del árbol": this.depicts = "http://timber.gsic.uva.es/sta/ontology/TreePart";
          break;
        case "Tronco": this.depicts = "http://timber.gsic.uva.es/sta/ontology/Trunk";
          break;
        case "Otra parte": this.depicts = "http://timber.gsic.uva.es/sta/ontology/OtherPart";
          break;
        case "Hoja": this.depicts = "http://timber.gsic.uva.es/sta/ontology/Leaf";
          break;
        case "Vista general": this.depicts = "http://timber.gsic.uva.es/sta/ontology/GeneralView";
          break;
        case "Fruto": this.depicts = "http://timber.gsic.uva.es/sta/ontology/Fruit";
          break;
        case "Flor": this.depicts = "http://timber.gsic.uva.es/sta/ontology/Flower";
          break;
        case "Copa": this.depicts = "http://timber.gsic.uva.es/sta/ontology/Crown";
          break;
        case "Rama": this.depicts = "http://timber.gsic.uva.es/sta/ontology/Branch";
          break;
      }
    }
    // Compruebo si rellena todos los campos
    if (this.especie != null && this.imagen != null){
      let especie_select;
      si = true;
      // Compruebo la especie seleccionada y busco su uri
      for (let clave in this.objSpecies){
        if (this.objSpecies[clave]["nivel"]== 0){
          if (this.objSpecies[clave][this.buscadorSpecies]["lits"].es == this.especie){ 
            especie_select = clave;
            break;
          }
        }
      }
      this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, image: this.base64, species: especie_select, title: this.title, description: this.description, depicts: this.depicts};

    } else{
      if (this.especie != null){
        si = true;
        // Busco la uri de la especie seleccionada para mandarla al servidor
        for (let clave in this.objSpecies){
          if (this.objSpecies[clave]["nivel"]== 0){
            if (this.objSpecies[clave][this.buscadorSpecies]["lits"].es == this.especie){ 
              this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, species: clave };
              break;
            }
          }
        }
      } else if (this.imagen != null){
        si = true;
        this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, image: this.base64, title: this.title, description: this.description, depicts: this.depicts};
        
      }
    }
      
    // Si no se ha metido en ninguna condicion anterior, es que solo ha metido la lat y lon
    if(!si){
      // Solo ha metido la localización 
      this.newTree = {creator:  this.creador, lat: this.lat, long: this.long};
    }
    
    console.log(JSON.stringify(this.newTree));
    // POST a la api
    this.api.createTree(JSON.stringify(this.newTree)).subscribe(
      (data) =>{
        console.log(data);
      },
      (error) =>{
        this.error2 = true;
        console.error(error);
        if (error.status == 0){
          this.mensajeError = "Parece que tenemos problemas con el servidor ";
        } else if (error.status == 413){
          this.mensajeError = "La imagen seleccionada ocupa demasiado espacio. Por favor, comprima el archivo antes de subirlo"
        } else if (error.status == 404){
          this.mensajeError = " Error 404. No se encuentra el árbol creado";
        }
        this.terminado2 = true;
      },
      () =>{
        this.terminado2 = true;
      }
      );

    // Tras mandar los datos al servidor, limpio las variables del formulario por si se crea otro
    this.lat = null;
    this.long = null;
    this.especie = null;
    this.imagen = null;
  }

  /******* Conversión de las imágenes a base64 para madar al servidor */
  selectFile(event){
    var metadata = {};
    var files = event.target.files;
    var file = files[0];

    if (files && file) {
        var reader = new FileReader();
        reader.onload =this.codeFile.bind(this);
        reader.readAsBinaryString(file);

       
      // Extraigo los metadatos de la imagen
      /*this.setDataImage(file).then((exifdata) => {
        Object.keys(exifdata).forEach((prop) => {
          if(prop != undefined){
              metadata[prop] = exifdata[prop];
          }
        });
      });
      console.log(metadata);
      this.convertirMetadata(metadata);*/
    }
  }

codeFile(event) {
    var binaryString = event.target.result;
    this.base64= btoa(binaryString);
    //console.log(this.base64);
    
    // Compruebo si la imagen ocupa menos de 10 Mb
    if (this.base64.length > 10000000){
      alert("La imagen seleccionada ocupa demasiado. Por favor, comprímala para que ocupe menos");
      this.base64 = null;
      this.imagen = null;
    }

  }

  /****************************** METADATOS *******************************/
  /*
  setDataImage(image_path){
     // Consigo los metadatos de la imagen
     return new Promise((resolve, reject) => {
      //console.log(image_path)
      this.getExifData(image_path).then((metadata) => {
        //Aqui va en forma de promise o callbak 
        resolve(metadata);
        
      })
    });

  }

  // Cargo los metadatos de la imagen: extraído de https://github.com/exif-js/exif-js
  getExifData(image) {
    var exif_metadata = {};
    var gps = {};

    return new Promise((resolve, reject) => {

      EXIF.getData(image, function(){
        var allMetaData = EXIF.getAllTags(this);
        
        if (allMetaData != undefined) { // compruebo si hay metadatos
          exif_metadata["DateTime"] = (allMetaData.DateTime != undefined) ? allMetaData.DateTime : 0;

          exif_metadata["GPSLatitude"] = (allMetaData.GPSLatitude != undefined) ? allMetaData.GPSLatitude : null;
          exif_metadata["GPSLatitudeRef"] = (allMetaData.GPSLatitudeRef != undefined) ? allMetaData.GPSLatitudeRef : null;
          exif_metadata["GPSLongitude"] = (allMetaData.GPSLongitude != undefined) ? allMetaData.GPSLongitude : null;
          exif_metadata["GPSLongitudeRef"] = (allMetaData.GPSLongitudeRef != undefined) ? allMetaData.GPSLongitudeRef : null;

          //console.log(allMetaData);
        }

        resolve(exif_metadata);

    });
    
    })
}
convertirMetadata(metadata){
  if (metadata["DateTime"] != 0){
    this.date_img = metadata.DateTime;
    console.log(metadata);
  }

  if(metadata["GPSLatitude"] != 0 && metadata["GPSLatitudeRef"] != 0 && metadata["GPSLongitude"] != 0 && metadata["GPSLongitudeRef"] != 0 ){
        var coordenadas = [];
        var lat = [];

     //console.log(metadata);

        //coordenadas = this.getCoordinates(metadata["GPSLatitude"], metadata["GPSLatitudeRef"], metadata["GPSLongitude"], metadata["GPSLongitudeRef"]);
        //this.lat_img = coordenadas[0];
        //this.long_img = coordenadas[1];
        console.log("Coordenadas: "+coordenadas[0]+" y "+ coordenadas[1]);
  }
}
getCoordinates(lat, long, latRef, longRef) {
  var coord = [];
  coord[0] = this.ConvertDMSToDD(lat[0], lat[1], lat[2], latRef);
  coord[1] = this.ConvertDMSToDD(long[0], long[1], long[2], longRef);
  return coord;
}

ConvertDMSToDD(degrees, minutes, seconds, direction) {
  var dd = degrees + minutes/60 + seconds/(60*60);

  if (direction == "S" || direction == "W") {
      dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
}*/


  //-----------------------------------------------------
  
  public construirFecha(): string{
    var f = new Date();
    var fecha;
    return fecha = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
  }
  public onSubmit2(){
    this.confirmacion = true;
  }


}
