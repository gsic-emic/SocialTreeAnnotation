import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Tree } from './tree';


@Injectable({
  providedIn: 'root'
})
export class APIService {

  private apiUrl = 'http://localhost:8888/sta/';  // URL to web api 
                                      

  constructor( private http: HttpClient) { }

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

  getUserAnnotatios (userId): Observable<any[]> {
    var urlComplete = "data/annotation?creator="+userId;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

}
