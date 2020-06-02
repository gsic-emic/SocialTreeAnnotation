import { Injectable } from '@angular/core';
import { Tree } from '../tree';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";


  constructor() { }

  // creo un objeto TypeScritp de tipo Tree[] con el objeto JSON devuelto para mostrarse en la pantalla adecuadamente
  crearTrees(objTrees: object, objSpecies: object){
    let trees = [];
    let i=0;
    for (let clave in objTrees){
      if (objTrees[clave].creator == "http://crossforest.eu/ifn/ontology/")
        { 
          objTrees[clave].creator = "IFN"
        } 
      // añado nombre vulgar a la especie
      for (let clav in objSpecies){
        if(objTrees[clave].species == objSpecies[clav]["uri"]){
          objTrees[clave].species = objSpecies[clav][this.buscadorSpecies]["lits"].es;
          break;
        }
      }
      objTrees[clave].date = "1/1/2020";
      trees[i] = { id: clave, lat: objTrees[clave].lat, long: objTrees[clave].long, species: objTrees[clave].species, creator:  objTrees[clave].creator, date: objTrees[clave].date};
      i++;
    }
    return trees;
  }
}
