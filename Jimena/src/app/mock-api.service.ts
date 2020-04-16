import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {MensajeService} from './mensaje.service';
import { Tree } from './tree';


@Injectable({
  providedIn: 'root'
})
export class MockAPIService {

  private apiUrl = 'http://timber.gsic.uva.es/';  // URL to web api 
                                      

  constructor( private http: HttpClient) { }

  /* GET the actual API structure*/
  getInfoAPI(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl); //devuelve un observable, que tendré que consumir con subscribe()
  }
  /* CON ESTA CONSULA DEBERÍA OBTENER:
  {
  "root": "/",
  "users": "/user",
  "user": "/user/:userId",
  "trees": "/sta/data/tree",
  "tree": "/sta/data/tree/:treeId",
  "annotations": "/sta/data/annotation",
  "annotation": "sta/data/annotation/:annotationId",
  "images": "/sta/data/image",
  "image": "/sta/data/image/:imagesId"
}*/


  /** GET a tree from the server */
  getTree (id): Observable<any[]> {
    var urlComplete = "sta/data/tree/"+id;
    return this.http.get<any[]>(this.apiUrl+urlComplete);
  }



  /** Log a TreeService message with the MessageService 
  //TENGO QUE DAR UNA VUELTA A ESTO DE LOS MENSAJES
  private log(message: string) {
  this.messageService.add(`HeroService: ${message}`);
  }*/
}
