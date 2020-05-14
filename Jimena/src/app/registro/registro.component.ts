import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  public nombre: string;
  public apellidos:string;
  public username: string;
  public email: string;
  public password: string;

  public onSubmit() {
    console.log("Nombre" + this.nombre +", "+ this.apellidos);
    console.log("Nombre de usuario:"+this.username);
  }

}
