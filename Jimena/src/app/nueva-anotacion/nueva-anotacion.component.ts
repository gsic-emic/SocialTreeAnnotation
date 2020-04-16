import { Component, OnInit } from '@angular/core';
import { Arbol } from '../arbol';

@Component({
  selector: 'app-nueva-anotacion',
  templateUrl: './nueva-anotacion.component.html',
  styleUrls: ['./nueva-anotacion.component.css']
})
export class NuevaAnotacionComponent implements OnInit {

  arbol: Arbol;
  lat: number;
  long: number;
  especie: string;
  hoja: string;
  fruto: string;
  imagen: string;
  creador = "Jimena";
  fecha: string;

  //variables de control
  submitted = false;
  confirmacion = false;
  constructor() { }

  ngOnInit(): void {
  }


  // método que pasa a la página para confirmar la nueva anotación
  onSubmit() { 
    this.submitted = true;
    this.fecha = this.construirFecha();
  }

  //acción que vuelve al formulario CON los datos que se han introducido
  volver(){
    this.submitted = false;
  }

  //método que borra los datos introducidos por el usuario y vuelve al formulacio de nueva anotación
  borrar_datos(){
    this.lat = null;
    this.long = null;
    this.especie = null;
    this.hoja = null;
    this.imagen = null;
    this.fruto = null;

    this.volver();
    this.confirmacion = false;
  }
  crearArbol(){
    /* Hacer esto me está dando problemas...aquí posiblemente se manden los datos directamente a la API
    this.arbol.lat = this.lat;
    this.arbol.long = this.long;
    this.arbol.especie = this.especie;
    this.arbol.creador = this.creador;
    this.arbol.imagen = this.imagen;
    this.arbol.fecha = this.construirFecha();
    this.arbol.id = "004";*/
  }
  construirFecha(): string{
    var f = new Date();
    var fecha;
    return fecha = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
  }
  onSubmit2(){
    this.confirmacion = true;
  }


}
