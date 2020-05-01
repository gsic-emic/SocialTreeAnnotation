import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-annot',
  templateUrl: './add-annot.component.html',
  styleUrls: ['./add-annot.component.css']
})
export class AddAnnotComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  //--------------------------------
  // Variables recogidas en el formulario
  public imagen: string;
  public lat: number;
  public long: number;
  public especie: string;
  public hoja: string;
  public fruto: string;

  //-----------------------------------
  // Variables de control
  public submitted: boolean = false;


  //-------------------------------------
  public onSubmit(){
    this.submitted = true;
  }
  //acción que vuelve al formulario CON los datos que se han introducido
  volver(){
    this.submitted = false;
  }

  //método que borra los datos introducidos por el usuario y vuelve al formulacio de nueva anotación
  public borrarDatos(){
    this.lat = null;
    this.long = null;
    this.especie = null;
    this.hoja = null;
    this.imagen = null;
    this.fruto = null;

    this.volver();
  }

}
