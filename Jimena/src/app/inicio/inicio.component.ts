/*                            InicioComponent
     Componente que muestra la página principal. Si existe conexión con el servidor, muestra el mapa
*/
import { Component, OnInit } from '@angular/core';
//----------------- SERVICES ---------------------------
import {APIService} from '../api.service';
//------------------------------------------------------

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  public error: boolean = false;
  public errorConexion: boolean = false;
  public terminado_species: boolean = false;
  public objSpecies: object=[];

  constructor(private api: APIService) { }
  

  ngOnInit(): void {
    // Antes de cargar nada, compruebo si hay conexión con el servidor
    this.comprobarConexion();
 }

 //---------------------------------
 /**
  * comprobarConexion
  */
 public comprobarConexion() {
   this.api.testConexion().subscribe(
    (data: any) =>{
      console.log('Hay conexión con el servidor');
      // Hay conexión, cargo las especies
      this.getSpecies();
    },
    (error) =>{
      console.error(error); // si se ha producido algún error
      alert("No se puede conectar con el servidor. Por favor, inténtelo de nuevo más tarde");
      this.errorConexion = true;
    });
 }

  //-----------------------------
  /**
   * getSpecies
   */
  public getSpecies() {
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
