import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  public apiUrl = 'http://timber.gsic.uva.es/sta/';  // URL to web api
  //public buscadorPartes = 'http://timber.gsic.uva.es/sta/ontology/TreePartPhoto';

  constructor(private http: HttpClient) { }

  /************** PARTES DE UN ARBOL ************************/ 

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
