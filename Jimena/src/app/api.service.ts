import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class APIService {

  private apiUrl = 'http://localhost:8888/sta/';  // URL to web api 
                                      

  constructor( private http: HttpClient) { }

  /* GET the actual API structure*/
  getTrees(url: string): Observable<string>{
    return this.http.get<string>(url); 
  }
  
  /** GET a tree from the server */
  getTree (id): Observable<any[]> {
    var urlComplete = "data/tree/"+id;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  getSpecies(): Observable<any[]> {
    var urlComplete = "data/species";
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }

  // Me devuelve todos los árboles creados por un usuario
  getUserTrees (userId): Observable<any[]> {
    var urlComplete = "data/tree?creator="+userId;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }




  /** Log a TreeService message with the MessageService 
  //TENGO QUE DAR UNA VUELTA A ESTO DE LOS MENSAJES
  private log(message: string) {
  this.messageService.add(`HeroService: ${message}`);
  }*/
}
