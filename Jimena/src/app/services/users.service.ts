import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  userUrl = 'http://timber.gsic.uva.es/sta/data/user/';  // URL to web api

  constructor(private http: HttpClient) { }

    /*********************** CREACION DE USUARIOS ******************************/
    public createUser(datos: string, username: string): Observable<string> {
      // Cabecera necesaria
      let urlComplete = this.userUrl+username;
      console.log("La url creada es: "+urlComplete);
      let headers = new HttpHeaders().set('Content-Type','application/json');
      return this.http.put<string>(urlComplete, datos, {headers: headers});
    }

    /****** Datos de la sesion *******/
    public getSessionName(): string{
      let username = sessionStorage.getItem('username');
      return username;
    }

    public getUserAutentication(): string{
      let username = sessionStorage.getItem('username');
      let password = sessionStorage.getItem('password');
      let autentication = username+":"+password;
      console.log(autentication);
      return autentication;
    }

    public clearSession(){
      sessionStorage.clear();
    }

}
