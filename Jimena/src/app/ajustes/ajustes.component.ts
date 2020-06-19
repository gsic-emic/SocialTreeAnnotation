/*                            AjustesComponent
     Componente que muestra diferentes opciones que puede hacer el usuario registrado. Por ahora:
     - Carga sus datos personales con posibilidad de modificarlos (esto último no implementado)
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//-----------------------------------------------------
import { User } from '../user';
//------------------- SERVICIOS -----------------------------
import { UsersService } from './../services/users.service';
import { UtilService } from './../services/util.service';
@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.css']
})
export class AjustesComponent implements OnInit {

  constructor(private UsersService: UsersService, private UtilService: UtilService, private router: Router) { }

  public user: User; // Objeto con toda la info del usuario actual
  public terminado: boolean = false;
  public error: boolean = false;
  public mensajeError: string;

  // Variables que recogen los datos si el usuario modifica su información personal
  public nombre: string;
  public username: string;
  public apellidos: string;
  public email: string;
  public password: string;

  ngOnInit(): void {
    // Compruebo si hay autenticación de usuario para que no se pueda acceder sin estar registrado
    if(!this.UsersService.comprobarLogIn()){
      this.router.navigate(['/inicio_sesion']); // el usuario no está loggeado, le mando a que inicie sesión
    } else{
      // El usuario si que está loggeado
      let username = this.UsersService.getSessionName();
      //Obtengo los datos del usuario actual
      this.obtenerDatosUsuario(username);
    }

  }
// ---------------------------------------------------------------
  /**
   * obtenerDatosUsuario: recupera los datos del usuario actual
   */
  public obtenerDatosUsuario(username: string) {
    this.UsersService.getUserInfo(username).subscribe(
      (data: any) =>{
        this.user = this.UsersService.createInfoUser(data.response);
      },
      (error) =>{
        this.error = true;
        console.error(error);
        this.mensajeError = this.UtilService.crearMensajeError(error.status);
        if(error.status == 404){
          alert(" No se encuentra la información del usuario");
        }
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
      }
      );
  }


  /**
   * onSubmit
   */
  public onSubmit() {
    
  }

  /**
   * borrarDatosSession
   */
  public borrarDatosSession() {
    this.UsersService.clearSession();
  }

}
