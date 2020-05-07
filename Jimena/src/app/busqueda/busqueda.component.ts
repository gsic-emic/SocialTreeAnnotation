import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ListaCompletaComponent } from './../lista-completa/lista-completa.component';
import { Observable } from  'rxjs';
//--------------------------
import {MockAPIService} from '../mock-api.service';
import {Tree} from '.././tree';
//-----------------------------

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {

  // El componente búsqueda es padre de lista-completa -> creo vínculo entre ellos para ver la variable del filtro
  //@ViewChild(ListaCompletaComponent) lista; 

  constructor(private api: MockAPIService) { }

  ngOnInit(): void {
   
  }
  comprobarFiltro(filtro: boolean){
    this.filtro = filtro;
  }

  //---------------------------------------
  // variables de control
  public submitted: boolean = false;
  public filtro: boolean = true;

  //---------------------------------------
  // Variables para obtender los datos almacenados en la api-
  public trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  public actualUrl: string = "http://localhost:8888/sta/data/tree";
  public nextUrl: string;
  public objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  public error: boolean = false;
  public terminado: boolean = false;


  // Variables para el control de los filtros del formulario
  public specie: string;
  public provincia: string; //------> para hacer búsquedas de árbol de una zona
  public creator: string;
  //public general: string;
  public provincias: Array<string> = ["Valladolid", "Burgos", "Palencia", "Salamanca", "León", "Zamora", "Ávila", "Segovia", "Soria"];
  public species: Array<string> = ["Castaño", "Pino", "Abeto", "http://crossforest.eu/ifn/ontology/Species36", "http://crossforest.eu/ifn/ontology/Species28"];
  public existen: boolean = false; //controla si hay algún árbol con los filtros introducidos
  // --------------------------------

  public onSubmit() { 
    this.submitted = true;
    this.searchTrees();
    console.log(this.trees);
  }
  public volver(){
    this.submitted = false;
  }

  public borrarDatos(){
    this.specie = null;
    this.creator = null;
    //this.recargar();
  }
  public recargar(){
    location.reload(true);
  }

  // esta función sufrirá modificaciones cuando esté hecha la consulta adecuada
  public searchTrees(){
    // compongo la url de la consulta con los datos introducidos
    //--------> aún no la puedo hacer porque no se cómo van a ser (de momento filtro los adecuados en convertirDato();)

    this.api.getTrees(this.actualUrl).subscribe(
      (data: any) =>{
        this.nextUrl = data.nextPage.url;
        this.objTrees = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        this.convertirDato();
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
  public createTree(id: string, latitud: number, longitud: number, specie: string, creator: string, image: string, date: string){
    let tree = { id: id, lat: latitud, long: longitud, species: specie, creator:  creator, image: image, date: date};
    //console.log("Se ha creado el siguiente árbol: "+ tree.id +":"+tree.lat, tree.long);
    return tree;
  }
  // creo un objeto TypeScritp de tipo Tree[] con el objeto JSON devuelto para mostrarse en la pantalla adecuadamente
  public convertirDato(){
    let i=0;
    for (let clave in this.objTrees){
      if (this.objTrees[clave].creator == "http://crossforest.eu/ifn/ontology/")
      { this.objTrees[clave].creator = "IFN"} 
      if (!this.objTrees[clave].image)
      {this.objTrees[clave].image = "./../assets/images/no-image.png";} // LA IMAGEN LA TENDRÉ QUE BUSCARLA EN UNA ANOTACIÓN
      this.objTrees[clave].date = "1/1/2020";
      //console.log(clave);

      //if(this.objTrees[clave].lat == this.lat && this.objTrees[clave].long == this.long){
        if (this.objTrees[clave].creator == this.creator && this.objTrees[clave].species == this.specie){
          this.existen = true;
          this.trees[i] = this.createTree(clave, this.objTrees[clave].lat, this.objTrees[clave].long, this.objTrees[clave].species, this.objTrees[clave].creator, this.objTrees[clave].image, this.objTrees[clave].date);
          i++;
      }
    }
  }
}
