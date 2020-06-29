/*********************** ImagesService *******************************/
/*
  Servicio que maneja funciones relacionadas con las imágenes
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnnotationService } from '../services/annotation.service';
import { APIService } from '../api.service';
import { Image } from '../Image';
import { UtilService } from '../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  public apiUrl = 'https://timber.gsic.uva.es/sta/';  // URL to web api
  public imageInfo: Observable<object>;
  public arrayInfo: object = [];

  public buscadorDescript = 'http://purl.org/dc/elements/1.1/description';
  public buscadorTitulo = 'http://purl.org/dc/elements/1.1/title';
  public buscadorImagen = 'http://timber.gsic.uva.es/sta/ontology/resource';
  public buscadorFecha = 'http://purl.org/dc/elements/1.1/created';

  // Array con las diferentes partes de la imagen
  public PARTES: Array<string> = ["Parte del árbol", "Tronco", "Otra parte", "Hoja", "Vista general", "Fruto", "Flor", "Copa", "Rama"];


  constructor(private http: HttpClient, private annotService: AnnotationService, private api: APIService,
    private util: UtilService) { }

/************** RECUPERAR DATOS DE UNA IMAGEN ************************/ 
/**
   * crearTrees: devuelve objeto TypeScritp de tipo Image[] del JSON entregado
   */
  public crearImage(objImage: object, imageURL: string): Image{
    let image;
    let title, description;
    if(objImage[imageURL][this.buscadorTitulo]){
      title = objImage[imageURL][this.buscadorTitulo].value;
    }
    if(objImage[imageURL][this.buscadorDescript]){
      description = objImage[imageURL][this.buscadorDescript].value;
    }
    let date = this.util.formatearFecha(objImage[imageURL][this.buscadorFecha].value);
    let jpeg = objImage[imageURL][this.buscadorImagen].value;

    image = {id: imageURL, jpeg: jpeg, date: date, title: title, description: description};    
    return image;
  }

/************** PARTES DE UN ARBOL EN LA IMAGEN ************************/ 

// Obtención de las partes de un árbol para el campo DEPICTS
public getTreeParts(): Observable<any[]> {
  var urlComplete = this.apiUrl+"data/treePart";
  return this.http.get<any[]>(urlComplete);
}

// Creación de la uri del campo depicts
public createUriDepicts(depicts: string){
  switch (depicts){
    case "Parte del árbol": depicts = "http://timber.gsic.uva.es/sta/ontology/TreePart";
      break;
    case "Tronco": depicts = "http://timber.gsic.uva.es/sta/ontology/Trunk";
      break;
    case "Otra parte": depicts = "http://timber.gsic.uva.es/sta/ontology/OtherPart";
      break;
    case "Hoja": depicts = "http://timber.gsic.uva.es/sta/ontology/Leaf";
      break;
    case "Vista general": depicts = "http://timber.gsic.uva.es/sta/ontology/GeneralView";
      break;
    case "Fruto": depicts = "http://timber.gsic.uva.es/sta/ontology/Fruit";
      break;
    case "Flor": depicts = "http://timber.gsic.uva.es/sta/ontology/Flower";
      break;
    case "Copa": depicts = "http://timber.gsic.uva.es/sta/ontology/Crown";
      break;
    case "Rama": depicts = "http://timber.gsic.uva.es/sta/ontology/Branch";
      break;
  }
  return depicts;
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
 
}
