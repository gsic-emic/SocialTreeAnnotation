import { Component, OnInit } from '@angular/core';
import { User } from './../user';
import { UsersService } from './../services/users.service';
import { UtilService } from './../services/util.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent implements OnInit {

  constructor(private UserService: UsersService, private UtilService: UtilService, private router: Router) { }

  public user: User;

  /* Variables de recogida en el formulario*/
  public nombre: string;
  public apellidos:string;
  public username: string;
  public email: string;
  public password: string;

  //Variables de control
  public terminado: boolean;
  public mensajeError: string;
  public repetido: boolean = false;



  ngOnInit(): void {
    // Se comprueba si el navegador es compatible con el login
    if (typeof(Storage) !== 'undefined') {
      // Código cuando Storage es compatible
    } else {
     // Código cuando Storage NO es compatible
     alert("El navegador utilizado no es compatible con el inicio de sesión. Por favor, pruebe con uno más moderno");
    }
  }
  
  public onSubmit() {
    this.user = {nombre: this.nombre, apellidos: this.apellidos, email: this.email, password: this.password};
    //console.log(JSON.stringify(this.user));

    // Hago POST al servicio
    this.registrarUsuario(JSON.stringify(this.user), this.username);  
  }

  public registrarUsuario(datosUsuario: string, username: string){

    this.UserService.createUser(datosUsuario, username).subscribe(
      (data) =>{
        console.log(data);
        // Guardo los datos de inicio en la sesión
        sessionStorage.setItem('username', this.username);
        sessionStorage.setItem('password', this.password);
        this.router.navigate(['/principal']);
      },
      (error) =>{
        console.error(error);
        this.mensajeError = this.UtilService.crearMensajeError(error.status);
        if (error.status == 400){
          alert("El nombre de usuario escogido ya está utilizado. Por favor, escoja uno nuevo.");
          this.repetido = true;
          this.username = null;
          this.user = null;
        }
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
      }
    );
  
  }

  public borrarDatos(){
    this.username = null;
    this.nombre = null;
    this.apellidos = null;
    this.email = null;
    this.password = null;
    this.repetido = false;
  }
  

}
