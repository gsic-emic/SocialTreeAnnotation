import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class APIService {

 apiUrl = 'http://timber.gsic.uva.es/sta/';  // URL to web api
//apiUrl = 'http://localhost:8888/sta/';  // URL to web api 
                                      

  constructor( private http: HttpClient) { }
  /*********************** RECUPERACIÓN DE DATOS DEL SERVIDOR ******************************/
  testConexion(): Observable<string>{
    return this.http.get<string>(this.apiUrl); 
  }

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
  createTree(datos: string, basicAuth: string): Observable<string> {
    // Cabecera necesaria
    // Codifico en base64 la autenticacion del usuario
    let auth = btoa('Basic '+basicAuth); //?????????????no se si el basic va ahí o no y si hay que codificarlo
    let headers = new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': auth
    });
    let url_postTree = this.apiUrl+'data/tree/';
    return this.http.post<string>(url_postTree, datos, {headers: headers}); 
  }


}
