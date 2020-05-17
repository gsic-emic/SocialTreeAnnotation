import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
//--------------------------
import {APIService} from '../api.service';
import {Tree} from '.././tree';
import { Specie } from '../species';
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
  // Variables para obtender los datos almacenados en la api-
  public allTrees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  public filterTrees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  public nextUrl: string;
  public objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  public error: boolean = false;
  public terminado: boolean = false;
  public objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  public ESPECIES: Array<string> = [];
  public buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";
  public buscadorUri: string = "uri";
  //-------------------------------------------------------------
  // Variables para el control de los filtros del formulario
  public specie: string;
  public creator: string;
  public existen: boolean = false; //controla si hay algún árbol con los filtros introducidos
  public activar_filtro: boolean = false;

  constructor(private api: APIService) { }

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
    this.filtrar();
    //this.existen = false
  }
  public volver(){
    location.reload(true);
  }

  public borrarDatos(){
    this.specie = null;
    this.creator = null;
    //this.recargar();
  }
  public recargar(){
    location.reload(true);
  }
  // Cargo todas las especies disponibles del sistema
  getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
        this.cargarEspecies();
        //console.log(this.objSpecies);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar las especies del sistema.");
        //this.terminado_species = true;
      },
      () =>{  // una vez que tengo las especies, pedo llamar a la funcion que obtiene los árboles
        this.searchTrees(41.7, -5.4, 41.8, -4.9);
      }
      );
  }
  cargarEspecies(){
    var i=0;
    for (let clave in this.objSpecies){
      if (this.objSpecies[clave]["nivel"]== 0){ // Las especies son de nivel 0
        this.ESPECIES[i] = this.objSpecies[clave][this.buscadorSpecies]["lits"].es;
        i++;
      }
    }
  }

  // esta función sufrirá modificaciones cuando esté hecha la consulta adecuada
  public searchTrees(lat0: number, long0: number, lat1: number, long1: number){
    // compongo la url de la consulta en funcion de la posicion del mapa que se esta viendo
    
    this.api.getTreesZone(lat0, long0, lat1, long1).subscribe(
      (data: any) =>{
        //this.nextUrl = data.nextPage.url;
        this.objTrees = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        this.convertirDatos();
        //console.log(data);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        this.terminado = true;
      },
      () =>{
        this.terminado = true; // si la consulta se realiza con éxito
      }
      );
  }
  // método que  crea un objeto de tipo Tree
  public createTree(id: string, latitud: number, longitud: number, specie: string, creator: string, date: string){
    let tree = { id: id, lat: latitud, long: longitud, species: specie, creator:  creator, date: date};
    //console.log("Se ha creado el siguiente árbol: "+ tree.id +":"+tree.lat, tree.long);
    return tree;
  }
  // creo un objeto TypeScritp de tipo Tree[] con el objeto JSON devuelto para mostrarse en la pantalla adecuadamente
  public convertirDatos(){
    let i=0;
    for (let clave in this.objTrees){
      if (this.objTrees[clave].creator == "http://crossforest.eu/ifn/ontology/")
        { 
          this.objTrees[clave].creator = "IFN"
        } 
      // añado nombre vulgar a la especie
      for (let clav in this.objSpecies){
        if(this.objTrees[clave].species == this.objSpecies[clav]["uri"]){
          this.objTrees[clave].species = this.objSpecies[clav][this.buscadorSpecies]["lits"].es;
          break;
        }
      }
      this.objTrees[clave].date = "1/1/2020";
      this.allTrees[i] = this.createTree(clave, this.objTrees[clave].lat, this.objTrees[clave].long, this.objTrees[clave].species, this.objTrees[clave].creator, this.objTrees[clave].date);
      i++;
    }
  }

  public filtrar(){
    var i=0;
    for (let clave in this.allTrees){
        // compruebo si hay filtros o se quieren mostrar todos
      if (this.specie && this.creator){ // se filtra por especie y creador
        if (this.allTrees[clave].species == this.specie && this.allTrees[clave].creator == this.creator){
            this.existen = true;
            this.filterTrees[i] = this.allTrees[i];
            console.log("\nSe ha filtrado este: " +this.filterTrees[i].species);
            i++;
        }
      }else{
        if (this.specie){ // solo se filtra por la especie
          if (this.allTrees[clave].species == this.specie){
            this.existen = true;
            this.filterTrees[i] = this.createTree(clave, this.allTrees[clave].lat, this.allTrees[clave].long, this.allTrees[clave].species, this.allTrees[clave].creator, this.allTrees[clave].date);
            console.log("\nSe ha filtrado este: " +this.filterTrees[i].species);
            i++;
          }
        }else{
          if (this.creator){ // solo se filtra por creador
            if (this.allTrees[clave].creator == this.creator){
              this.existen = true;
              this.filterTrees[i] = this.createTree(clave, this.allTrees[clave].lat, this.allTrees[clave].long, this.allTrees[clave].species, this.allTrees[clave].creator, this.allTrees[clave].date);
              console.log("\nSe ha filtrado este: " +this.filterTrees[i].species);
              i++;
            }
          }
        }
      }
    }
    if(!this.existen){
      console.log("No existen árboles con ese filtro");
    }
  }
}
