import { Injectable } from '@angular/core';
import { APIService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {

  private buscador_vulgarName: string = "http://crossforest.eu/ifn/ontology/vulgarName";
  public objSpecies: object=[];


  constructor(private api: APIService) { }

  getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        alert("Ha habido un error al intentar cargar las especies del sistema.");
      });
  }
  

  public cargarEspecies(objSpecies: object[]){
    let i=0;
    let ESPECIES = [];
    for (let clave in objSpecies){     
      if (objSpecies[clave]["nivel"]== 0){ // Las especies son de nivel 0
        ESPECIES[i] = objSpecies[clave][this.buscador_vulgarName]["lits"].es;
        i++;
      }
    }
    return ESPECIES;
  }

  public buscarUri(objSpecies: object[], especie: string){

    // Compruebo la especie seleccionada y busco su uri
    for (let clave in objSpecies){
      if (objSpecies[clave]["nivel"]== 0){
        if (objSpecies[clave][this.buscador_vulgarName]["lits"].es == especie){ 
          var especie_select = clave;
          //console.log(especie_select);
          return especie_select;
        }
      }
    }
  }
}
