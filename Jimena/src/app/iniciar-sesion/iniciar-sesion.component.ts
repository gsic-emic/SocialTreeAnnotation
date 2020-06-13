import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.component.html',
  styleUrls: ['./iniciar-sesion.component.css']
})
export class IniciarSesionComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Se comprueba si el navegador es compatible con el login
    if (typeof(Storage) !== 'undefined') {
      // Código cuando Storage es compatible
    } else {
     // Código cuando Storage NO es compatible
     alert("El navegador utilizado no es compatible con el inicio de sesión. Por favor, pruebe con uno más moderno");
    }
  }
  public username: string;
  public password: string;

  public onSubmit(){
    // Guardo los datos de inicio en la sesión
    sessionStorage.setItem('username', this.username);
    sessionStorage.setItem('password', this.password);

    this.router.navigate(['/principal']);

  }

}
