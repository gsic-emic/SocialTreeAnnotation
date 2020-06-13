import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UsersService } from './../services/users.service';
import { UtilService } from './../services/util.service';
@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.css']
})
export class AjustesComponent implements OnInit {

  constructor(private UsersService: UsersService, private UtilService: UtilService) { }

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
    let username = this.UsersService.getSessionName();
    //Obtengo los datos del usuario actual
    this.obtenerDatosUsuario(username);
    //this.user = {nombre: "Jimena", apellidos: "Andrade", username: "jandrade", email: "jimena@hotmail.com"};
  }

  //------------ Recuperación de los datos del usuario actual -------------------//
  public obtenerDatosUsuario(username: string){
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


  public onSubmit() {
  }

  public borrarDatosSession(){
    this.UsersService.clearSession();
  }

}
