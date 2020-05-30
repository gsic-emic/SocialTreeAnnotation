import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {

  private buscador_vulgarName: string = "http://crossforest.eu/ifn/ontology/vulgarName";


  constructor() { }
  

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
