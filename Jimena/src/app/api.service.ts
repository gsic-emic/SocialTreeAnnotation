import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Tree } from './tree';


@Injectable({
  providedIn: 'root'
})
export class APIService {

  apiUrl = 'http://localhost:8888/sta/';  // URL to web api 
  url_postTree = 'http://localhost:8888/sta/data/tree';
                                      

  constructor( private http: HttpClient) { }
  /*********************** RECUPERACIÓN DE DATOS DEL SERVIDOR *****************************+*/

  /* GET all the trees storaged on the system */
  getTrees(url: string): Observable<string>{
    return this.http.get<string>(url); 
  }
  // Me devuelve los arboles almacenados en una zona especificadas por 2 latitudes y 2 longitudes
  getTreesZone(lat0: number, long0: number, lat1: number, long1: number): Observable<string>{
    var urlComplete = "data/tree?lat0="+lat0+"&long0="+long0+"&lat1="+lat1+"&long1="+long1;
    //console.log(urlComplete);
    return this.http.get<string>(this.apiUrl+urlComplete); 
  }
  
  // Recuepera el árbol con el id que se le pase
  getTree (id): Observable<any[]> {
    var urlComplete = "data/tree/"+id;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  // Devuelve todas las FAMILIAS, GENEROS y ESPECIES  que hay en la ontologia
  getSpecies(): Observable<any[]> {
    var urlComplete = "data/species";
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  // Me devuelve todos los árboles creados por un usuario
  getUserTrees (userId): Observable<any[]> {
    var urlComplete = "data/tree?creator="+userId;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  getInfoTree (urlTree): Observable<any[]> {
    return this.http.get<any[]>(urlTree);
  }

  getAnnotation(urlAnnot): Observable<object> {
    return this.http.get<object>(urlAnnot);
  }

  getUserAnnotatios (userId): Observable<any[]> {
    var urlComplete = "data/annotation?creator="+userId;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  /*********************** CREACIÓN DE DATOS EN EL SERVIDOR ******************************/
  createTree(datos: string): Observable<string> {
    //Construyo el JSON que necesita el backend
    let headers = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
    return this.http.post<string>(this.url_postTree, datos, {headers: headers}); //¿necesito cabeceras?
  }


}
