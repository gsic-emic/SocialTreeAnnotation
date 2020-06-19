/*                            PrincipalComponent
     Componente que se encarga de la página de bienvenida del usuario registrado
*/
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
//------------------- SERVICIOS -----------------------------
import { UsersService } from './../services/users.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  public username: string; // Nombre de usuario para mostrar en la interfaz


  constructor(private UsersService: UsersService, private router: Router) { }

  ngOnInit(): void {
    // Compruebo si hay autenticación de usuario para que no se pueda acceder sin estar registrado
    if(!this.UsersService.comprobarLogIn()){
      this.router.navigate(['/inicio_sesion']); // el usuario no está loggeado, le mando a que inicie sesión
    }else{
      // El usuario si que está loggeado, guardo su nombre de usuario
      this.username = this.UsersService.getSessionName();
    }
  }

  /**
   * borrarDatosSession: se activa cuando "clikea" en cerrar sesión
   */
  public borrarDatosSession() {
    this.UsersService.clearSession();
  }

}
