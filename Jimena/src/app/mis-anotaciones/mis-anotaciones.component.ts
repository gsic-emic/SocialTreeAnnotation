import { Component, OnInit } from '@angular/core';
import {APIService} from '../api.service';
import {Tree} from '.././tree';

@Component({
  selector: 'app-mis-anotaciones',
  templateUrl: './mis-anotaciones.component.html',
  styleUrls: ['./mis-anotaciones.component.css']
})
export class MisAnotacionesComponent implements OnInit {

  arboles: boolean = true;
  existen: boolean = false;
  user: string = "user001";
  objSpecies: object[]=[];
  objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  error: boolean = false;
  terminado: boolean = false;
  terminado_species: boolean = false;
  buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";



  constructor(private api: APIService) { }

  ngOnInit(): void {
    this.getSpecies();
  }

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
      },
      () =>{  // una vez que tengo las especies, pedo llamar a la funcion que obtiene los árboles
        this.getMyTrees(this.user);
      }
      );
  }
  getMyTrees(url: string){
    this.api.getUserTrees(url).subscribe(
      (data: any) =>{
        //this.nextUrl = data.nextPage.url;
        this.objTrees = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        //console.log(data);
        this.convertirDato();
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar los árboles del sistema. Por favor, inténtelo de nuevo más tarde o recargue la página");
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
      }
      );
  }
  // método que  crea un objeto de tipo Tree
  createTree(id: string, latitud: number, longitud: number, specie: string, creator: string, date: string){
    let tree = { id: id, lat: latitud, long: longitud, species: specie, creator:  creator, date: date};
    //console.log("Se ha creado el siguiente árbol: "+ tree.id +":"+tree.lat, tree.long);
    return tree;
  }
  // creo un objeto TypeScritp de tipo Tree[] con el objeto JSON devuelto para mostrarse en la pantalla adecuadamente
  convertirDato(){
    let i=0;
    for (let clave in this.objTrees){
      if (this.objTrees[clave].creator == "http://crossforest.eu/ifn/ontology/")
        { 
          this.objTrees[clave].creator = "IFN"
        } 
      for (let clav in this.objSpecies){
        if(this.objTrees[clave].species == this.objSpecies[clav]["uri"]){
          this.objTrees[clave].species = this.objSpecies[clav][this.buscadorSpecies]["lits"].es;
          break;
        }
      }
      this.objTrees[clave].date = "1/1/2020";
      this.trees[i] = this.createTree(clave, this.objTrees[clave].lat, this.objTrees[clave].long, this.objTrees[clave].species, this.objTrees[clave].creator, this.objTrees[clave].date);
      i++;
    }
  }

  
  

}
