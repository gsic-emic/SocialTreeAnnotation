/*********************** AnnotationService *******************************/
/*
  Servicio que maneja funciones relacionadas con las anotaciones
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  public urlAnnot: string = 'http://timber.gsic.uva.es/sta/data/annotation';

  // Variables para el filtrado de los tipos de anotaciones en la api
  public AssertedPossition: string = "http://timber.gsic.uva.es/sta/ontology/hasAssertedPosition"; //Anotacion validada por expertos
  public PrimaryPossition: string = "http://timber.gsic.uva.es/sta/ontology/hasPrimaryPosition"; // La mejor valorada
  public Possition: string = "http://timber.gsic.uva.es/sta/ontology/hasPositionAnnotation"; // Una cualquiera
  public AssertedSpecies: string = "http://timber.gsic.uva.es/sta/ontology/hasAssertedSpecies";
  public PrimarySpecies: string = "http://timber.gsic.uva.es/sta/ontology/hasPrimarySpecies";
  public Species: string = "http://timber.gsic.uva.es/sta/ontology/hasSpeciesAnnotation";
  public Image: string = "http://timber.gsic.uva.es/sta/ontology/hasImageAnnotation";
  public tipoAnnot: string = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
  public buscadorFecha: string = "http://purl.org/dc/elements/1.1/created";
  public buscadorLong: string = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
  public buscadorLat: string = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
  public buscador_taxon: string = "http://timber.gsic.uva.es/sta/ontology/hasTaxon";
  public buscador_image: string = "http://timber.gsic.uva.es/sta/ontology/hasImage";
  public buscador_creador: string = "http://purl.org/dc/elements/1.1/creator";
  public buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";

  constructor(private http: HttpClient) { }


  /************************* CREAR ANOTACIONES *********************************/
  /**
   * createAnnot
   */
  public createAnnot(datos: string, basicAuth: string): Observable<string> {
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
