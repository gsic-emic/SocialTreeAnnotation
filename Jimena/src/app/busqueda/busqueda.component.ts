import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
//--------------------------
import {APIService} from '../api.service';
import {Tree} from '.././tree';
import { SpeciesService } from '../services/species.service';
//-----------------------------

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {

  // El componente búsqueda es padre de lista-completa -> creo vínculo entre ellos para ver la variable del filtro
  //@ViewChild(ListaCompletaComponent) lista; 
  //---------------------------------------
  // variables de control
  public submitted: boolean = false;
  public filtro: boolean = true;
  //---------------------------------------
  public error: boolean = false;
  public terminado_species: boolean = true;
  public objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  public ESPECIES: Array<string> = [];
  //-------------------------------------------------------------
  // Variables para el control de los filtros del formulario
  public specie: string;
  public creator: string;
  public existen: boolean = false; //controla si hay algún árbol con los filtros introducidos
  public activar_filtro: boolean = false;

  constructor(private api: APIService, private speciesServ: SpeciesService) { }

  ngOnInit(): void {
    this.getSpecies(); // nada más cargarse que recoja las especies, dentro de esta funcion ya se llama a la de getTrees 
 }
  
  // --------------------------------
  comprobarFiltro(filtro: boolean){
    this.filtro = filtro;
  }

  public onSubmit() { 
    this.submitted = true;
    //this.activar_filtro = true;
    //this.filtrar();
    //this.existen = false
  }
  public volver(){
    location.reload(true);
  }

  public borrarDatos(){
    this.specie = null;
    this.creator = null;
    this.recargar();
  }
  public recargar(){
    location.reload(true);
  }
  // Cargo todas las especies disponibles del sistema
  getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
        this.ESPECIES = this.speciesServ.cargarEspecies(this.objSpecies);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar las especies del sistema.");
        this.terminado_species = true;
      },
      () =>{ 
        this.terminado_species = true;
      }
      );
  }
  
}
