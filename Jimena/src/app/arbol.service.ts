
import { Injectable } from '@angular/core';
import { Arbol } from './arbol';
import { ARBOLES } from './mock-trees';
//import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
//import { Observable, of, from } from 'rxjs';
//import { catchError, map, tap } from 'rxjs/operators';
//import { MensajeService } from './mensaje.service'

@Injectable({
  providedIn: 'root'
})
export class ArbolService {

  constructor() { }


/* Función que me devuelve los árboles almacenados */
getArboles(): Arbol[] {
    return ARBOLES;
}

/* Función que me devuelve los árboles de un determinado usuario*/
getUserTrees(usuario: String): Arbol[]{
  var j = 0;
  var userTrees = [];
  for (var i = 0; i <= ARBOLES.length; i++) {
    if (ARBOLES[i].creador == usuario){
      userTrees[j] = ARBOLES[i];
      j++;
    }
  }
  return userTrees;
}
}

/* CÓDIGO PARA COMUNCICARME CON LA API REST VÍA HTTP
@Injectable({
  providedIn: 'root'
})
export class ArbolService {

  constructor(private http: HttpClient, private mensajeService: MensajeService) { }

  
  private treesUrl = 'http://timber.gsic.uva.es:8888/api/trees';  // URL to web api
  Tree: Array<any> = [];

  /** GET trees from the server 
    //el body de la respuesta del servidor se almacenará en Tree[]
 getTrees (): Observable<Tree[]> {
  this.mensajeService.add('TreeService: fetched trees');
  return this.http.get<Tree[]>(this.treesUrl)
    .pipe(
      tap(_ => this.log('árboles encontrados')),
      catchError(this.handleError<Tree[]>('getTrees', []))
    );
}


/**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 
private handleError<T> (operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    // TODO: better job of transforming error for user consumption
    this.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}*/

