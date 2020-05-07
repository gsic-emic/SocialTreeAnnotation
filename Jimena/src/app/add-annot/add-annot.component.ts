import { Component, OnInit } from '@angular/core';
import { Annotation } from '../Annotation';


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
  public tipo: Array<string> = ["Imagen", "Ubicación", "Especie", "Hoja", "Fruto"];
  public type: string;
  public imagen: string;
  public lat: number;
  public long: number;
  public especie: string;
  public hoja: string;
  public fruto: string;

  //-----------------------------------
  // Variables de control
  public submitted: boolean = false;
  public submitted2: boolean = false;

  //-----------------------------------
  public newAnnot: Annotation;


  //-------------------------------------
  public onSubmit(){
    this.submitted = true;
  }
  public onSubmit2(){
    this.crearAnotacion();
    this.submitted2 = true;
    console.log(this.newAnnot);
  }
  crearAnotacion(){
    let especTipo: string;
    // Diferencio el tipo de anotacion que se ha seleccionado
    switch (this.type){
      case 'Imagen': 
        this.newAnnot = {id: "????????", creator: "Jimena", date: "28/04/2020", type:{ image: this.imagen}};
        break;
      case 'Ubicación': 
        this.newAnnot = {id: "????????", creator: "Jimena", date: "28/04/2020", type:{ location:{ lat: this.lat, long: this.long}}};
        break;
      case 'Especie': 
        this.newAnnot = {id: "????????", creator: "Jimena", date: "28/04/2020", type:{ specie: this.especie}};
        break;
      case 'Hoja': 
        this.newAnnot = {id: "????????", creator: "Jimena", date: "28/04/2020", type:{ hoja: this.hoja}};
        break;
      case 'Fruto': 
        this.newAnnot = {id: "????????", creator: "Jimena", date: "28/04/2020", type:{ fruto: this.fruto}};
        break; 
    }   
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
