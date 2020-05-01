import { Component, OnInit } from '@angular/core';

//--------------------------
import {MockAPIService} from '../mock-api.service';
import {Tree} from '.././tree';
//-----------------------------

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(private api: MockAPIService) { }

  //-----------------------------
  public mapa: boolean = true;
  public actualUrl: string = "http://localhost:8888/sta/data/tree";
  public nextUrl: string;
  public objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  public trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  public error: boolean = false;
  public terminado: boolean = false;
  

  ngOnInit(): void {
    this.getTrees(this.actualUrl);
 }

  //-----------------------------
  // Recojo el JSON con todos los árboles y la URL a la siguiente página mediante la funcion GET del servicio
  getTrees(url: string){
    this.api.getTrees(url).subscribe(
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
        this.terminado = true;
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
      { this.objTrees[clave].creator = "IFN"} 
      // LA IMAGEN LA TENDRÉ QUE BUSCAR EN UNA ANOTACIÓN ---> de momento pongo que no hay
      this.objTrees[clave].image = "./../assets/images/no-image.png";
      this.objTrees[clave].date = "1/1/2020";
      this.trees[i] = this.createTree(clave, this.objTrees[clave].lat, this.objTrees[clave].long, this.objTrees[clave].species, this.objTrees[clave].creator, this.objTrees[clave].image, this.objTrees[clave].date);
      i++;
    }
  }


  //----------------------------------------------------------


  /* Método con árboles de prueba metidos a mano ----------------------------
  getArboles(): void {
    this.arboles = this.arbolService.getArboles();
  }
  //---------------------------------------------------------------------------*/
}
