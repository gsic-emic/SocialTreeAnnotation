import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
//import { UtilService } from './../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  public urlAnnot: string = 'http://timber.gsic.uva.es/sta/data/annotation';

  // Variables para el filtrado de los tipos de anotaciones en la api
  AssertedPossition: string = "http://timber.gsic.uva.es/sta/ontology/hasAssertedPosition"; //Anotacion validada por expertos
  PrimaryPossition: string = "http://timber.gsic.uva.es/sta/ontology/hasPrimaryPosition"; // La mejor valorada
  Possition: string = "http://timber.gsic.uva.es/sta/ontology/hasPositionAnnotation"; // Una cualquiera
  AssertedSpecies: string = "http://timber.gsic.uva.es/sta/ontology/hasAssertedSpecies";
  PrimarySpecies: string = "http://timber.gsic.uva.es/sta/ontology/hasPrimarySpecies";
  Species: string = "http://timber.gsic.uva.es/sta/ontology/SpeciesAnnotation";
  Image: string = "http://timber.gsic.uva.es/sta/ontology/hasImageAnnotation";
  tipoAnnot: string = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
  buscadorFecha: string = "http://purl.org/dc/elements/1.1/created";
  buscadorLong: string = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
  buscadorLat: string = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
  buscador_taxon: string = "http://timber.gsic.uva.es/sta/ontology/hasTaxon";
  buscador_image: string = "http://timber.gsic.uva.es/sta/ontology/hasImage";
  buscador_creador: string = "http://purl.org/dc/elements/1.1/creator";
  buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";

  constructor(private http: HttpClient) { }


  /************************* CREAR ANOTACIONES *********************************/
  createAnnot(datos: string, basicAuth: string): Observable<string> {
    // Cabecera necesaria
    // Codifico en base64 la autenticacion del usuario
    let auth = btoa(basicAuth); 
    let headers = new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'Basic '+auth, // Especifico que es autenticación básica y codifico en base64 user:pwd
    });
    return this.http.post<string>(this.urlAnnot, datos, {headers: headers}); 
  }

 
}
