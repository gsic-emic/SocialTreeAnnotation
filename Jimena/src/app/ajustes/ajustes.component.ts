import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { from } from 'rxjs';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.css']
})
export class AjustesComponent implements OnInit {

  constructor() { }

  public user: User; // De momento la creo a mano, en su momento esta variable será la que esté en todo el sistema
                      // con los datos del usuario actual

  public nombre: string;
  public apellidos:string;
  public username: string;
  public email: string;
  public password: string;


  ngOnInit(): void {
    this.user = {id: "user001", nombre: "Jimena", apellidos: "Andrade", username: "jandrade", email: "jimena@hotmail.com"};
  }

  public onSubmit() {
    
  }

}
