import { Component, OnInit } from '@angular/core';
import { APIService} from '../api.service';
import { Tree} from '.././tree';
import { Annotation } from '../Annotation';
import { AnnotationService } from './../services/annotation.service';
import { UtilService } from './../services/util.service';
import { TreeService } from './../services/tree.service';
import { UsersService } from './../services/users.service';


@Component({
  selector: 'app-mis-anotaciones',
  templateUrl: './mis-anotaciones.component.html',
  styleUrls: ['./mis-anotaciones.component.css']
})
export class MisAnotacionesComponent implements OnInit {

  // Variables de control -----------------------
  arboles: boolean = true;
  existen: boolean = true; // variable que controla si el usuario tiene arboles creados
  existen_anot: boolean = true;
  error: boolean = false;
  error_anot: boolean = false;
  terminado: boolean = false;
  terminado_species: boolean = false;
  terminado_anot: boolean = false;
  user: string;

  // Variables de almacenamiento de los daros recuperados------------------------
  objSpecies: object[]=[];
  objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  objAnnotations: Annotation[] = []; // Objeto JSON que almacena todas las anotaciones del usuario
  annotations: Annotation[] = []; // datos de las anotaciones modelados

  constructor(private api: APIService, private annot: AnnotationService, private util: UtilService,
    private tree: TreeService, private userService: UsersService) { }

  ngOnInit(): void {
    this.getSpecies();
    // Recojo el username 
    this.user = this.userService.getSessionName();

    this.getMyAnnotatios(this.user);

  }
   
  /****************************** SPECIES **************************/
  getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
        
        //console.log(this.objSpecies);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        this.terminado = true;
        alert("Ha habido un error al intentar cargar las especies del sistema.");
      },
      () =>{  // una vez que tengo las especies, pedo llamar a la funcion que obtiene los árboles
        this.getMyTrees(this.user);
      }
      );
  }

    /****************************** TREES **************************/
  getMyTrees(user: string){
    this.api.getUserTrees(user).subscribe(
      (data: any) =>{
        //this.nextUrl = data.nextPage.url;
        if(data == null){
          this.existen = false; // no tiene arboles
        } else{
          this.objTrees = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
          // Convierto los datos devueltos en objetos tipo Tree
        this.trees = this.tree.crearTrees(this.objTrees, this.objSpecies);
        }
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

    /****************************** ANNOTATIONS **************************/
  getMyAnnotatios(user: string){
    this.api.getUserAnnotatios(user).subscribe(
      (data: any) =>{
        if(data == null){
          this.existen_anot = false; // no tiene arboles
        } else {
          this.objAnnotations = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        }
        this.convertirAnnot();
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error_anot = true;
        alert("Ha habido un error al intentar cargar los árboles del sistema. Por favor, inténtelo de nuevo más tarde o recargue la página");
        this.terminado_anot = true;
      },
      () =>{
        this.terminado_anot = true;
      }
      );
    }

  // creo un objeto TypeScritp de tipo Annotation[] con el objeto JSON devuelto para mostrarse en la pantalla adecuadamente
  convertirAnnot(){
    let i=0;
    let primary;
    let asserted;
    let tipo: string;
    let date: string;
    let lat, long, especie, image;

    for (let clave in this.objAnnotations){
      primary = false;
      asserted = false;
      // Primero compruebo el tipo de anotacion que es
      switch (this.objAnnotations[clave][this.annot.tipoAnnot].value){
        case "http://timber.gsic.uva.es/sta/ontology/PrimaryPosition":
          primary = true; //es una anotacion de tipo localización y ademas es una anotacion primaria
          tipo = "location";
          lat = Number(this.objAnnotations[clave][this.annot.buscadorLat].value);
          long = Number(this.objAnnotations[clave][this.annot.buscadorLong].value);
          break;
        case "http://timber.gsic.uva.es/sta/ontology/AssertedSpecies":
          asserted = true;
          tipo = "specie";
          especie = this.objAnnotations[clave][this.annot.buscador_taxon].value;
          break;
        case "http://timber.gsic.uva.es/sta/ontology/ImageAnnotation":
            tipo = "image";
            image = this.objAnnotations[clave][this.annot.buscador_image].value;
            break;
        case "http://timber.gsic.uva.es/sta/ontology/PositionAnnotation":
            tipo = "location";
            lat = Number(this.objAnnotations[clave][this.annot.buscadorLat].value);
            long = Number(this.objAnnotations[clave][this.annot.buscadorLong].value);
            break;
        case "http://timber.gsic.uva.es/sta/ontology/SpeciesAnnotation":
            tipo = "specie";
            especie = this.objAnnotations[clave][this.annot.buscador_taxon].value;
            break;
      }
      // Recupero la fecha (si no tiene me la invento: las del ifn)
      if(!this.objAnnotations[clave][this.annot.buscadorFecha]){
        date = "01/01/2020";
      } else{
        date = this.util.formatearFecha(this.objAnnotations[clave][this.annot.buscadorFecha].value);
      }
      //creo la anotacion en funcion del tipo
      switch (tipo){
        case "location":
          this.annotations[i] = {id: clave, creator: this.user, date: date, primary: primary, asserted: asserted, type: {location: {lat: lat, long: long}}};
          break;
        case "specie":
          this.annotations[i] = {id: clave, creator: this.user, date: date, primary: primary, asserted: asserted, type: {specie: especie}};
          break;
        case "image":
          this.annotations[i] = {id: clave, creator: this.user, date: date, primary: primary, asserted: asserted, type: {image: image}};
          break;
      }
      i++;
    }
  }
  
  

}
