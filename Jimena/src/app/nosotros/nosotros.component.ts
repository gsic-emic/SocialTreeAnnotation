import { Component, OnInit } from '@angular/core';
import {MockAPIService} from '../mock-api.service';
import {Tree} from '.././tree';


@Component({
  selector: 'app-nosotros',
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.css']
})
export class NosotrosComponent implements OnInit {

  public dataAPI: any;
  public trees: Tree[];
  public consultaAPI: boolean = true;
  public dataTree: any;
  public dataAPI_exito: boolean = false;
  public pulsado: boolean = false;
  public terminado: boolean = false;
  public buenos: Tree[]=[];
  public nextUrl: string;

  public num: number;
  public id: Array<string>=[];
  public lat: Array<string>=[];
  public long: Array<string>=[];
  public todo: string;

  public obj: Array<any>;


  constructor(private api: MockAPIService) { }

  ngOnInit(): void {
  }
/*
  createTree(id: string, latitud: number, longitud: number, specie: string){
    let tree = { id: id, lat: latitud, long: longitud, species: specie };
    console.log("Se ha creado el siguiente árbol: "+ tree.id +":"+tree.lat, tree.long);
    return tree;
  }

  convertirDato(){
    let i=0;
    for (let clave in this.trees){
      this.buenos[i] = this.createTree(String(i), this.trees[clave].lat, this.trees[clave].long, JSON.stringify(this.trees[clave].species), this.objTrees[clave].creator);
      i++;
    }
  }*/
/*
  getTrees(){
    var i=0;
    this.api.getTrees().subscribe(
      (data: any) =>{
        this.nextUrl = data.nextPage.url;
        this.trees = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        //this.convertirDato();
        for (let clave in this.trees){
          this.id.push(JSON.stringify(this.trees[clave]));
          //this.buenos.push(JSON.stringify(this.trees[clave]));
          this.lat.push(JSON.stringify(this.trees[clave].lat)); // para adaptar el objeto a un string y que se pueda mostrar en pantalla
          this.long.push(JSON.stringify(this.trees[clave].long));
          i++;
        }
/*          console.log(clave+": " +this.trees[clave]);
          console.log("Latitud: " +this.trees[clave]['lat']);
          console.log("Longitud: " +this.trees[clave]['long']);
          this.tree[i]['lat'] = this.trees[clave]['lat'];
          this.tree[i]['long'] = this.trees[clave]['long'];
          this.tree[i]['long'] = this.trees[clave]['species'];
          i++;
        }
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        console.log("Ha habido un error al conectarse con el servidor");
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
      }
      );
      this.pulsado = true;
  }*/

  getInfoAPI(){
    this.api.getInfoAPI().subscribe(
      (data) =>{
        this.dataAPI = data; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        console.log("La consulta se ha realizado con éxito y se ha obtendio lo siguiente: " + this.dataAPI);
        this.dataAPI_exito = true;
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        console.log("Ha habido un error al conectarse con el servidor");
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
      }
      );
      this.pulsado = true;
  }

  /*getTree(treeId){
    this.consultaAPI = false;
    this.api.getTree(this.treeId).subscribe(
      (data) =>{
        this.dataTree = data; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        console.log("La consulta se ha realizado con éxito y se ha obtendio lo siguiente: " + this.dataAPI);
        this.dataAPI_exito = true;
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
      }
      );
      this.pulsado = true;
  }

  reintentar(){
    //inicializo todos los valores y vuelvo a realizar la consulta
    this.dataAPI_exito = false;
    this.pulsado = false;
    this.terminado = false;
    if (this.consultaAPI){
      this.getInfoAPI()
    }else{
      this.getTree(this.treeId)
    } 
  }*/
}
