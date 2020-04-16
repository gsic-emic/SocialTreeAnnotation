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
  public consultaAPI: boolean = true;
  public dataTree: any;
  public dataAPI_exito: boolean = false;
  public pulsado: boolean = false;
  public terminado: boolean = false;
  public treeId: string = "001";

  constructor(private api: MockAPIService) { }

  ngOnInit(): void {
  
  }


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

  getTree(treeId){
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
  }
}
