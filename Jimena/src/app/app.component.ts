import { Component, OnInit } from '@angular/core';
import {MockAPIService} from './mock-api.service';
import { Specie } from './species';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  
  constructor(private api: MockAPIService) { }

  buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/hasAcceptedName>/<http://crossforest.eu/ifn/ontology/name";

  ngOnInit(): void {
    this.getSpecies();
  }
  getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.sacarSpecie(data.response);
        //console.log(data.response);
      },
      /*(error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar las especies del sistema.");
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
      }*/
      );
  }
  sacarSpecie(objSpecies: Array<string>){
    let i=0;
    for(let clave in objSpecies){
      //this.especies[i] = objSpecies[clave][this.buscadorSpecies]["lits"].la;
      i++;
    }
  }

}
export const ESPECIES: Specie[] = [];