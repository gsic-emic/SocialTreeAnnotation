import { Component, OnInit } from '@angular/core';
//--------------------------
import {APIService} from '../api.service';
//-----------------------------

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(private api: APIService) { }

  //-----------------------------
  public mapa: boolean = true;

  public error: boolean = false;
  public terminado_species: boolean = false;
  public objSpecies: object=[];
  

  ngOnInit(): void {
    // Antes de cargar nada, compruebo si hay conexión con el servidor
    this.comprobarConexion();
 }

 //-----------------------------
 public comprobarConexion(){
   this.api.testConexion().subscribe(
    (data: any) =>{
      console.log('Hay conexión con el servidor');
      // Hay conexión, cargo las especies
      this.getSpecies();
    },
    (error) =>{
      console.error(error); // si se ha producido algún error
      alert("No se puede conectar con el servidor. Por favor, inténtelo de nuevo más tarde");
    });
 }

  //-----------------------------
  getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar las especies del sistema.");
      },
      () =>{
        this.terminado_species = true;
      }
      );
  }
  //----------------------------------------------------------
}
