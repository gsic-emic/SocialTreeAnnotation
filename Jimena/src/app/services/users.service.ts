import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  userUrl = 'http://timber.gsic.uva.es/sta/data/user/';  // URL to web api
  //userUrl = 'http://localhost:8888/sta/data/user/';

  constructor(private http: HttpClient) { }

    /*********************** CREACION DE USUARIOS ******************************/
    createUser(datos: string, username: string): Observable<string> {
      // Cabecera necesaria
      let urlComplete = this.userUrl+username;
      console.log("La url creada es: "+urlComplete);
      let headers = new HttpHeaders().set('Content-Type','application/json');
      return this.http.put<string>(urlComplete, datos, {headers: headers});
    }

}
