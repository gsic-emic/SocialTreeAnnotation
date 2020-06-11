import { Component, OnInit } from '@angular/core';

//--------------------------
import {APIService} from '../api.service';
import {Tree} from '.././tree';
import { Specie } from '../species';
//-----------------------------

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(private api: APIService) { }

  //-----------------------------
  mapa: boolean = true;

  error: boolean = false;
  terminado_species: boolean = false;
  objSpecies: object=[];
  

  ngOnInit(): void {
    this.getSpecies(); // nada más cargarse que recoja las especies
 }

  //-----------------------------
  getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
        //console.log(this.objSpecies);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar las especies del sistema.");
        //this.terminado_species = true;
      },
      () =>{
        this.terminado_species = true;
      }
      );
  }
  //----------------------------------------------------------
}
