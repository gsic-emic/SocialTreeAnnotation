/*********************** UsersService *******************************/
/*
  Servicio que maneja funciones relacionadas con los usuarios
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { User } from './../user';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  public userUrl = 'https://timber.gsic.uva.es/sta/data/user/';  // URL to web api

  // Buscadores para el filtrado de los datos devueltos por el servidor
  public buscadorNombre: string = "http://xmlns.com/foaf/0.1/name";
  public buscadorUsername: string = "http://xmlns.com/foaf/0.1/nick";
  public buscadorEmail: string = "http://xmlns.com/foaf/0.1/mbox";
  public buscadorFecha: string = "http://purl.org/dc/elements/1.1/created";

  constructor(private http: HttpClient, private util: UtilService) { }

  /*********************** RECUPERAR DATOS UN USUARIO ******************************/
  /**
   * getUserInfo
   */
  public getUserInfo(username): Observable<any[]>{
    let urlComplete = this.userUrl+username; // creo la url de la consulta con el nombre de usuario
    return this.http.get<any[]>(urlComplete);
  }

  /*********************** INICIO DE SESION ******************************/
  /**
   * login
   */
  public login(datos: string): Observable<string> {
    let headers = new HttpHeaders().set('Content-Type','application/json'); // Cabecera necesaria
    let url = 'https://timber.gsic.uva.es/sta/';
    return this.http.post<string>(url, datos, {headers: headers});
  }



    /*********************** CREACION DE USUARIOS ******************************/
    /**
     * createUser
     */
    public createUser(datos: string, username: string,): Observable<string> {
      // Cabecera necesaria
      let urlComplete = this.userUrl+username;
      console.log("La url creada es: "+urlComplete);
      let headers = new HttpHeaders().set('Content-Type','application/json');
      return this.http.put<string>(urlComplete, datos, {headers: headers});
    }

    /********************** CONTROL DE LA SESIÓN SEL USUARIO ACTUAL *******************/
    /**
     * getSessionName
     */
    public getSessionName(): string{
      let username = sessionStorage.getItem('username');
      return username;
    }

    /**
     * getUserAutentication
     */
    public getUserAutentication(): string{
      let username = sessionStorage.getItem('username');
      let password = sessionStorage.getItem('password');
      let autentication = username+":"+password;
      //console.log(autentication);
      return autentication;
    }

    /**
     * clearSession
     */
    public clearSession() {
      sessionStorage.clear();
    }

    /**
   * comprobarLogIn: comprueba si el usuario tiene la sesión iniciada
   */
  public comprobarLogIn(): boolean {
    let username = this.getSessionName();
      
    if(username == null){ // el usuario no está loggeado
      //console.log("No se ha iniciado sesión");
      return false;
    }else{
      return true;
    }
  }

    /************* Creación de un usuario a partir de los datos devueltos por el servidor **********/
    /**
     * createInfoUser
     */
    public createInfoUser(objUser: object): User{
      for (let clave in objUser){
        let created;
        let nombreCompleto = objUser[clave][this.buscadorNombre].value;
        let username = objUser[clave][this.buscadorUsername].value;
        let email = objUser[clave][this.buscadorEmail].value;
        if( objUser[clave][this.buscadorFecha]){
          created = objUser[clave][this.buscadorFecha].value;
          created = this.util.formatearFecha(created);
        } else {
          created = "No disponible";
        }
        
        
        let infoUSer = { nombre: nombreCompleto, username: username, email: email, created: created};
        return infoUSer;
      }
    }
      
    /**
      * adaptarUsername: conversión de la url completa de un usuario a su username
    */
    public adaptarUsername(userUrl: string): string{
      // http://timber.gsic.uva.es/sta/data/user/jimena22 -----> jimena22
      let array = userUrl.split('/');
      let username = array[6];
      return username;
    }

}
