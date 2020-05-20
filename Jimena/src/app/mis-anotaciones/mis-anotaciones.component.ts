import { Component, OnInit } from '@angular/core';
import {APIService} from '../api.service';
import {Tree} from '.././tree';
import { Annotation } from '../Annotation';

@Component({
  selector: 'app-mis-anotaciones',
  templateUrl: './mis-anotaciones.component.html',
  styleUrls: ['./mis-anotaciones.component.css']
})
export class MisAnotacionesComponent implements OnInit {

  // Variables de control -----------------------
  arboles: boolean = true;
  existen: boolean = false;
  error: boolean = false;
  error_anot: boolean = false;
  terminado: boolean = false;
  terminado_species: boolean = false;
  terminado_anot: boolean = false;
  user: string = "ifn";

  // Variables de almacenamiento de los daros recuperados------------------------
  objSpecies: object[]=[];
  objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  objAnnotations: Annotation[] = []; // Objeto JSON que almacena todas las anotaciones del usuario
  annotations: Annotation[] = []; // datos de las anotaciones modelados
  buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";
  tipoAnnot: string = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
  buscadorFecha: string = "http://purl.org/dc/elements/1.1/created";
  buscadorLong: string = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
  buscadorLat: string = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
  buscador_taxon: string = "http://timber.gsic.uva.es/sta/ontology/hasTaxon";
  buscador_image: string = "http://timber.gsic.uva.es/sta/ontology/hasImage";



  constructor(private api: APIService) { }

  ngOnInit(): void {
    this.getSpecies();
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
        this.objTrees = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        //console.log(data);
        this.convertirDato();
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
  // método que  crea un objeto de tipo Tree
  createTree(id: string, latitud: number, longitud: number, specie: string, creator: string, date: string){
    let tree = { id: id, lat: latitud, long: longitud, species: specie, creator:  creator, date: date};
    //console.log("Se ha creado el siguiente árbol: "+ tree.id +":"+tree.lat, tree.long);
    return tree;
  }
  // creo un objeto TypeScritp de tipo Tree[] con el objeto JSON devuelto para mostrarse en la pantalla adecuadamente
  convertirDato(){
    let i=0;
    for (let clave in this.objTrees){
      if (this.objTrees[clave].creator == "http://crossforest.eu/ifn/ontology/")
        { 
          this.objTrees[clave].creator = "IFN"
        } 
      for (let clav in this.objSpecies){
        if(this.objTrees[clave].species == this.objSpecies[clav]["uri"]){
          this.objTrees[clave].species = this.objSpecies[clav][this.buscadorSpecies]["lits"].es;
          break;
        }
      }
      this.objTrees[clave].date = "1/1/2020";
      this.trees[i] = this.createTree(clave, this.objTrees[clave].lat, this.objTrees[clave].long, this.objTrees[clave].species, this.objTrees[clave].creator, this.objTrees[clave].date);
      i++;
    }
  }
    /****************************** ANNOTATIONS **************************/
  getMyAnnotatios(user: string){
    this.api.getUserAnnotatios(user).subscribe(
      (data: any) =>{
        //this.nextUrl = data.nextPage.url;
        this.objAnnotations = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        console.log(data);
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

    // método que  crea un objeto de tipo Tree
  /*createAnno(id: string, latitud: number, longitud: number, specie: string, creator: string, date: string){
    let annot = { id: id, creator:  creator, date: date, type: type: {specie: "Pino"}};
    //console.log("Se ha creado el siguiente árbol: "+ tree.id +":"+tree.lat, tree.long);
    return annot;
  }*/
  // creo un objeto TypeScritp de tipo Annotation[] con el objeto JSON devuelto para mostrarse en la pantalla adecuadamente
  convertirAnnot(){
    let i=0;
    let primary = false;
    let tipo: string;
    let date: string;
    let lat, long, especie, image;

    for (let clave in this.objAnnotations){
      // Primero compruebo el tipo de anotacion que es
      switch (this.objAnnotations[clave][this.tipoAnnot].value){
        case "http://timber.gsic.uva.es/sta/ontology/PrimaryPosition":
          primary = true; //es una anotacion de tipo localización y ademas es una anotacion primaria
          tipo = "location";
          lat = this.objAnnotations[clave][this.buscadorLat].value;
          long = this.objAnnotations[clave][this.buscadorLong].value;
          break;
        case "http://timber.gsic.uva.es/sta/ontology/AssertedSpecies":
          primary = true; //es una anotacion de tipo especie y ademas es una anotacion primaria
          tipo = "specie";
          especie = this.objAnnotations[clave][this.buscador_taxon].value;
          break;
        case "http://timber.gsic.uva.es/sta/ontology/ImageAnnotation":
            primary = false; //es una anotacion de tipo imagen 
            tipo = "image";
            image = this.objAnnotations[clave][this.buscador_image].value;
            break;
        case "http://timber.gsic.uva.es/sta/ontology/PositionAnnotation":
            primary = false; //es una anotacion de tipo localizacion, pero no es la primaria
            tipo = "location";
            lat = this.objAnnotations[clave][this.buscadorLat].value;
            long = this.objAnnotations[clave][this.buscadorLong].value;
            break;
        case "http://timber.gsic.uva.es/sta/ontology/SpeciesAnnotation":
            primary = false; //es una anotacion de tipo especie, pero no es la primaria
            tipo = "specie";
            especie = this.objAnnotations[clave][this.buscador_taxon].value;
            break;
      }
      // Recupero la fecha (si no tiene me la invento: las del ifn)
      if(!this.objAnnotations[clave][this.buscadorFecha]){
        date = "01/01/2020";
      } else{
        date = this.objAnnotations[clave][this.buscadorFecha].value;
      }
      //creo la anotacion en funcion del tipo
      switch (tipo){
        case "location":
          this.annotations[i] = {id: clave, creator: this.user, date: date, type: {location: {lat: lat, long: long}}};
          break;
        case "specie":
          this.annotations[i] = {id: clave, creator: this.user, date: date, type: {specie: especie}};
          break;
        case "image":
          this.annotations[i] = {id: clave, creator: this.user, date: date, type: {image: image}};
          break;
      }
      i++;
    }
  }

  
  

}
