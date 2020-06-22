/*                            ComunidadComponent
    No implementado para esta versión
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//------------------- SERVICIOS -----------------------------
import { UsersService } from './../services/users.service';

@Component({
  selector: 'app-comunidad',
  templateUrl: './comunidad.component.html',
  styleUrls: ['./comunidad.component.css']
})
export class ComunidadComponent implements OnInit {

  constructor(private UsersService: UsersService, private router: Router) { }

  ngOnInit(): void {

    // Compruebo si hay autenticación de usuario para que no se pueda acceder sin estar registrado
    if(!this.UsersService.comprobarLogIn()){
      this.router.navigate(['/inicio_sesion']); // el usuario no está loggeado, le mando a que inicie sesión
    } 
  }

}
