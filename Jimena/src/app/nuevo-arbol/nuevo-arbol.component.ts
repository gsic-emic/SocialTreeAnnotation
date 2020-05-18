import { Component, OnInit } from '@angular/core';
import { Tree } from '../tree';

@Component({
  selector: 'app-nuevo-arbol',
  templateUrl: './nuevo-arbol.component.html',
  styleUrls: ['./nuevo-arbol.component.css']
})
export class NuevoArbolComponent implements OnInit {

  // Variables para recoger los datos del cuestionario
  public newTree: Tree;
  public lat: number;
  public long: number;
  public especie: string;
  public hoja: string;
  public fruto: string;
  public imagen: string;
  public creador = "Jimena";
  public fecha: string;

  //variables de control
  public submitted: boolean = false;
  public confirmacion: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }


  // método que pasa a la página para confirmar la nueva anotación
  public onSubmit() { 
    this.submitted = true;
    this.fecha = this.construirFecha();
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
    this.confirmacion = false;
  }
  public createTree(id: string, latitud: number, longitud: number, specie: string, creator: string, image: string, date: string){
    let tree = { id: id, lat: latitud, long: longitud, species: specie, creator:  creator, image: image, date: date};
    console.log("Se ha creado el siguiente árbol: "+ tree.id +":"+tree.lat, tree.long + "especie:"+tree.species);
    return tree;
  }
  public saveNewTree(){
    this.newTree = this.createTree('', this.lat, this.long, this.especie, this.creador, this.imagen, this.fecha);
  }
  public construirFecha(): string{
    var f = new Date();
    var fecha;
    return fecha = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
  }
  public onSubmit2(){
    this.confirmacion = true;
  }


}
