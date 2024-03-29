/*                            IniciarSesionComponent
     Componente que comprueba la autenticación de un usuario. Si es correcta, le redirige a la página
     principal de usuarios registrados
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//----------------- SERVICES ---------------------------
import { UsersService } from './../services/users.service';


@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.component.html',
  styleUrls: ['./iniciar-sesion.component.css']
})
export class IniciarSesionComponent implements OnInit {

  public username: string;
  public password: string;

  constructor(private router: Router, private UsersService: UsersService) { }

  ngOnInit(): void {
    // Se comprueba si el navegador es compatible con las sesiones
    if (typeof(Storage) !== 'undefined') {
      // Código cuando Storage es compatible
    } else {
     // Código cuando Storage NO es compatible
     alert("El navegador utilizado no es compatible con el inicio de sesión. Por favor, pruebe con uno más moderno");
    }
  }
  //-----------------------------------------------------
  
  /**
   * onSubmit
   */
  public onSubmit() {
    // Creo el JSON con los datos del usuario
    let user = {idUser: this.username, password: this.password};

    // Consulto con el servicio si los datos de acceso son correctos
    this.comprobarLogIn(JSON.stringify(user));
  }

  /**
   * comprobarLogIn
   */
  public comprobarLogIn(json: string) {
    let error = false;

    this.UsersService.login(json).subscribe(
      (data) =>{
        // Los datos de acceso son correctos
        sessionStorage.setItem('username', this.username);  // Guardo los datos de inicio en la sesión
        sessionStorage.setItem('password', this.password);

        // LLevo al usuario a la página principal
        this.router.navigate(['/principal']);
      },
      (error) =>{
        console.error(error);
        //this.mensajeError = this.UtilService.crearMensajeError(error.status);
        if (error.status == 401){
          alert("Tu nombre de usuario o contraseña son incorrectos. Por favor, inténtelo de nuevo");
        }else if(error.status == 200){
          // Los datos de acceso son correctos
        sessionStorage.setItem('username', this.username);  // Guardo los datos de inicio en la sesión
        sessionStorage.setItem('password', this.password);

        // LLevo al usuario a la página principal
        this.router.navigate(['/principal']);
        }
        this.username = null; // borro los campos del cuestionario
        this.password = null;
      },
      () =>{
        //console.log("Los datos de acceso son correctos");
      }
      );
  }
  //-----------------------------------------------------

}
