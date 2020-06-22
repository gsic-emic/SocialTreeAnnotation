/*                            MapaUsuariosComponent
    Componente que muestra el mapa en la zona de usuarios registrados
*/
import { Component, OnInit } from '@angular/core';
//--------------------------
import {APIService} from '../api.service';
//-----------------------------

@Component({
  selector: 'app-mapa-usuarios',
  templateUrl: './mapa-usuarios.component.html',
  styleUrls: ['./mapa-usuarios.component.css']
})
export class MapaUsuariosComponent implements OnInit {

  public objSpecies: object=[];
  public terminado_species: boolean = false;
  public error: boolean = false;


  constructor(private api: APIService) { }

  ngOnInit(): void {
    this.getSpecies();
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

}
