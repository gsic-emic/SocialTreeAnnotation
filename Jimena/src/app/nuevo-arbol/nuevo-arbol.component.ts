import { Component, OnInit } from '@angular/core';
import { Tree } from '../tree';
import { APIService} from '../api.service';

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

  constructor(private api: APIService) { }

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
  //contstruyo el arbol, lo convierto a JSON y hago un POST a la api
  public createTree(){
    this.newTree = {creator:  "Jimena", lat: this.lat, long: this.long };
    //console.log(JSON.stringify(this.newTree));
    let prueba = "{creator: Jimena, lat:56, long:3}";
    console.log(prueba);


    // POST a la api
    this.api.createTree(prueba).subscribe(
      (data) =>{
      },
      (error) =>{
        console.error(error);
      },
      () =>{
      }
      );
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
