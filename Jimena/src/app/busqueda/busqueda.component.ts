/*                            BusquedaComponent
     Filtra por especie y usuario para dar la lista de árboles con esas características.
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//------------------------------------------------
import {Tree} from '.././tree';
//------------------- SERVICIOS -----------------------------
import { APIService } from '../api.service';
import { SpeciesService } from '../services/species.service';
import { UsersService } from './../services/users.service';
import { TreeService } from '../services/tree.service';
//-----------------------------

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {

  //---------------------------------------
  // variables de control
  public submitted: boolean = false;
  public hay: boolean = true; // controla si hay árboles con los filtros selecionados
  public error: boolean = false;
  
  //---------------------------------------
  public terminado_species: boolean = true;
  public objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  public ESPECIES: Array<string> = [];
  public objTrees: object[]=[];
  public trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  public treesFinal: Tree[]=[];

  //-------------------------------------------------------------
  // Variables para el control de los filtros del formulario
  public especie: string;
  public creador: string;
 

  constructor(private api: APIService, private speciesServ: SpeciesService, private router: Router,
    private UsersService: UsersService, private TreeService: TreeService) { }

  ngOnInit(): void {
    // Compruebo si hay autenticación de usuario para que no se pueda acceder sin estar registrado
    if(!this.UsersService.comprobarLogIn()){
      this.router.navigate(['/inicio_sesion']); // el usuario no está loggeado, le mando a que inicie sesión
    } else{
      // El usuario si que está loggeado
      this.getSpecies(); // nada más cargarse que recoja las especies, dentro de esta funcion ya se llama a la de getTrees 
    }
 }
  
  // --------------------------------
  
  /**
   * onSubmit
   */
  public onSubmit() { 
    this.submitted = true;
    // Diferencio si filtra por especie o no
    if(this.especie != undefined){ // filtro por especie primero
      let uriSpecie = this.speciesServ.buscarUri(this.objSpecies, this.especie);
      let nombreSpecie = this.speciesServ.adaptarNombreSpecie(uriSpecie);
      this.getTreeSpecies(nombreSpecie); // Filtro los árboles por especie
    } else{
      //Filtro solo por nombre de usuario
      this.getUserTrees(this.creador);

    }
    
  }

  /**
   * borrarDatos
   */
  public borrarDatos() {
    this.especie = null;
    this.creador = null;
    this.trees.splice(0, this.trees.length); // Borro los árboles
    this.treesFinal.splice(0, this.treesFinal.length);
    this.recargar();
  }

  /**
   * recargar
   */
  public recargar() {
    location.reload(true);
  }
  
  /**
   * getSpecies
   */
  public getSpecies() {
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

  //-----------------------------
  /**
   * getTreeSpecies
   */
  public getTreeSpecies(species) {
    this.api.getTreeSpecies(species).subscribe(
      (data: any) =>{
        if(data != null){
          this.objTrees = data.response;
          this.trees = this.TreeService.crearTrees(this.objTrees, this.objSpecies);
          // Filtro por creador, si se ha introducido
          if(this.creador != undefined){
            this.treesFinal = this.TreeService.filtrarPorCreador(this.creador, this.trees);
          }else{
            this.treesFinal = this.trees;
          }
          //Compruebo si tras el filtrado hay árboles que mostrar
          if(this.treesFinal.length == 0){
            this.hay = false;
          } else{
            this.hay = true;
          }
        } else{
          this.hay = false;
          console.log("No hay árboles con esas características");
        }
        
      },
      (error) =>{
        this.error = true;
        alert("Ha habido un error al intentar cargar los árboles filtrados. Por favor, inténtelo de nuevo más tarde");
        this.hay = false;
      },
      () =>{
      }
      );
  }

  /**
   * getUserTrees
   */
  public getUserTrees(user: string) {
    this.api.getUserTrees(user).subscribe(
      (data: any) =>{
        if(data == null){
          this.hay = false; // no tiene arboles
        } else{
          this.objTrees = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
          // Convierto los datos devueltos en objetos tipo Tree
        this.treesFinal = this.TreeService.crearTrees(this.objTrees, this.objSpecies);
        }
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar los árboles filtrados. Por favor, inténtelo de nuevo más tarde");
      },
      () =>{
      }
      );
  }
  //----------------------------------------------------------
  
}
