import { Injectable } from '@angular/core';
// ------------------------------------------
import { Tree } from '../tree';
//---------- Servicios ----------------------
import { APIService } from './../api.service';
import { UtilService } from './util.service';
import { UsersService } from './../services/users.service';


@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private buscadorSpecies: string = 'http://crossforest.eu/ifn/ontology/vulgarName';
  public buscadorFecha: string = 'http://purl.org/dc/elements/1.1/created';


  constructor(private user: UsersService, private api: APIService, private util: UtilService) { }

  /**
   * crearTrees: devuelve objeto TypeScritp de tipo Tree[] del JSON entregado para mostrarse en la pantalla adecuadamente
   */
  public crearTrees(objTrees: object, objSpecies: object): Tree[]{
    let trees = [];
    let i=0;
    let username;
    for (let clave in objTrees){
      if (objTrees[clave].creator == "http://crossforest.eu/ifn/ontology/"){ 
          username = "IFN"
      } else{
        username = this.user.adaptarUsername(objTrees[clave].creator);
      }
      // añado nombre vulgar a la especie
      for (let clav in objSpecies){
        if(objTrees[clave].species == objSpecies[clav]["uri"]){
          objTrees[clave].species = objSpecies[clav][this.buscadorSpecies]["lits"].es;
          break;
        }
      }
      
      trees[i] = { id: clave, lat: objTrees[clave].lat, long: objTrees[clave].long, species: objTrees[clave].species, creator:  username};
      i++;
    }
    return trees;
  }

  


 

  
}


