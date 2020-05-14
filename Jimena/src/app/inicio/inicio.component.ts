import { Component, OnInit } from '@angular/core';

//--------------------------
import {MockAPIService} from '../mock-api.service';
import {Tree} from '.././tree';
import { Specie } from '../species';
//-----------------------------

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(private api: MockAPIService) { }

  //-----------------------------
  mapa: boolean = true;
  actualUrl: string = "http://localhost:8888/sta/data/tree";
  url_zona: string = "http://localhost:8888/sta/data/tree?lat0=41.7&long0=-5.4&lat1=41.8&long1=-4.9"
  nextUrl: string;
  objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  error: boolean = false;
  terminado: boolean = false;
  terminado_species: boolean = false;
  especies: Specie[] = [];
  objSpecies: object[]=[];
  buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";
  buscadorUri: string = "uri";
  

  ngOnInit(): void {
    this.getSpecies(); // nada más cargarse que recoja las especies, dentro de esta funcion ya se llama a la de getTrees 
 }

  //-----------------------------
  // Recojo el JSON con todos los árboles y la URL a la siguiente página mediante la funcion GET del servicio
  getTrees(url: string){
    this.api.getTrees(url).subscribe(
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
      () =>{  // una vez que tengo las especies, pedo llamar a la funcion que obtiene los árboles
        this.getTrees(this.url_zona);
      }
      );
  }
  // método que  crea un objeto de tipo Tree
  createTree(id: string, latitud: number, longitud: number, specie: string, creator: string, image: string, date: string){
    let tree = { id: id, lat: latitud, long: longitud, species: specie, creator:  creator, image: image, date: date};
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
      // LA IMAGEN LA TENDRÉ QUE BUSCAR EN UNA ANOTACIÓN ---> de momento pongo que no hay
      this.objTrees[clave].image = "./../assets/images/no-image.png";
      this.objTrees[clave].date = "1/1/2020";
      this.trees[i] = this.createTree(clave, this.objTrees[clave].lat, this.objTrees[clave].long, this.objTrees[clave].species, this.objTrees[clave].creator, this.objTrees[clave].image, this.objTrees[clave].date);
      i++;
    }
  }
  //----------------------------------------------------------
}
