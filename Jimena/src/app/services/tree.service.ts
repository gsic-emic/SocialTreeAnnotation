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
  private buscadorFecha: string = 'http://purl.org/dc/elements/1.1/created';


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

      // Busco la fecha de creación en la url completa
      let fecha = this.buscarFechaTree(clave); //---------NO ME FUNCIONA!!!!!
      console.log(fecha);
      
      trees[i] = { id: clave, lat: objTrees[clave].lat, long: objTrees[clave].long, species: objTrees[clave].species, creator:  username, date: fecha};
      i++;
    }
    return trees;
  }


  /**
   * buscarFechaTree: buca en la url del árbol la fecha de creación
   */
  public buscarFechaTree(urlTree: string) {
    let fecha;

    this.api.getInfoTree(urlTree).subscribe(
      (data: any) =>{
        if (data.response[urlTree][this.buscadorFecha]){
          let fechaCompleta = data.response[urlTree][this.buscadorFecha].value;
          fecha = this.util.formatearFecha(fechaCompleta);
          console.log(fecha);
          return fecha;
        }
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        alert("Ha habido un error al intentar cargar la información de tus árboles. Por favor, inténtelo de nuevo más tarde o recargue la página");
      });
        
  }

  
}


