/*********************** APIService *******************************/
/*
  Servicio que maneja todas las consultas HTTP con el servidor
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class APIService {

 public apiUrl = 'http://timber.gsic.uva.es/sta/';  // URL to web api
                                      

  constructor( private http: HttpClient) { }
  
  /*********************** RECUPERACIÓN DE DATOS DEL SERVIDOR ******************************/
  /**
   * testConexion: comprueba que existe conexión con la api 
   */
  public testConexion(): Observable<string>{
    return this.http.get<string>(this.apiUrl); 
  }

  /**
   * getTrees: recupera todos los árboles almacenados en el sistema
   */
  public  getTrees(url: string): Observable<string>{
    return this.http.get<string>(url); 
  }
  
  /**
   * getTreesZone: devuelve los arboles almacenados en una zona especificadas por 2 latitudes y 2 longitudes
   */
  public getTreesZone(lat0: number, long0: number, lat1: number, long1: number): Observable<string>{
    var urlComplete = "data/tree?lat0="+lat0+"&long0="+long0+"&lat1="+lat1+"&long1="+long1;
    //console.log(urlComplete);
    return this.http.get<string>(this.apiUrl+urlComplete); 
  }

  /**
   * getTree: recupera la información del árbol cuyo id se le pasa como parámetro de entrada
   */
  public getTree(id: string): Observable<any[]> {
    var urlComplete = "data/tree/"+id;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  /**
   * getTreeSpecies: recupera todos los árboles de la especie que se le pasa
   */
  public getTreeSpecies(specie: string): Observable<any[]> {
    var urlComplete = "data/tree?species="+specie;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  /**
   * getSpecies: devuelve todas las FAMILIAS, GENEROS y ESPECIES  que hay en la ontologia
   */
  public getSpecies(): Observable<any[]> {
    var urlComplete = "data/species";
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  
  /**
   * getUserTrees: devuelve todos los árboles creados por un usuario
   */
  public getUserTrees(userId): Observable<any[]> {
    var urlComplete = "data/tree?creator="+userId;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  /**
   * getInfoTree
   */
  public getInfoTree(urlTree): Observable<any[]> {
    return this.http.get<any[]>(urlTree);
  }

  /**
   * getAnnotation
   */
  public getAnnotation(urlAnnot): Observable<object> {
    return this.http.get<object>(urlAnnot);
  }

  /**
   * getUserAnnotatios
   */
  public getUserAnnotatios(userId): Observable<any[]> {
    var urlComplete = this.apiUrl+"data/annotation?creator="+userId;
    return this.http.get<any[]>(urlComplete);
  }

  /************** RECUPERAR ANOTACIÓN DE IMAGEN ************************/ 
  /**
   * getAnnotImage
   */
  public getAnnotImage(url): Observable<any[]> {
    return this.http.get<any[]>(url);
  }

  /*********************** CREACIÓN DE DATOS EN EL SERVIDOR ******************************/
  /**
   * createTree
   */
  public createTree(datos: string, basicAuth: string): Observable<string> {
    // Cabecera necesaria
    // Codifico en base64 la autenticacion del usuario
    let auth = btoa(basicAuth); 
    let headers = new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'Basic '+auth, // Especifico que es autenticación básica y codifico en base64 user:pwd
      'Access-Control-Allow-Origin': 'POST'
    });
    //let headers = new HttpHeaders().set('Content-Type','application/json');
    let url_postTree = this.apiUrl+'data/tree/';
    return this.http.post<string>(url_postTree, datos, {headers: headers}); 
  }


}
