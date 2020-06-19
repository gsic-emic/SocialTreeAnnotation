import { Component, OnInit, Input } from '@angular/core';
import { Tree} from '.././tree';
import { Annotation } from '.././Annotation';
import { APIService } from '../api.service';
import { UtilService } from './../services/util.service';
import { AnnotationService } from './../services/annotation.service';
import { UsersService } from '../services/users.service';
import { ImagesService } from '../services/images.service';




@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada
  @Input() SPECIES: object;
  
  tree_selected: Tree;
  objInfoTree: object = [];
  objAnnot: object = [];
  public imageInfo: object = [];
  public imageURL: string;
  annotations: Annotation[]=[];
  IsPossitionAsserted: boolean = false; // Estas dos variables controlan si los datos son oficiales
  IsSpeciesAsserted: boolean = false;   // para que se muestre una indicación en la interfaz


  //Variables de control -------------------------
  submitted = false;
  error: boolean = false;
  terminado: boolean = false;
  error_anot: boolean = false;
  terminado_anot: boolean = false;
  i: number = 0; //controla el numero de anotaciones que tiene el árbol

  constructor(private api: APIService, private util: UtilService, private annot: AnnotationService,
    private user: UsersService, private imageService: ImagesService) { }

  ngOnInit(): void {
     
  }
  
  //-------------------------------------------------------
  obtenerIdSelecionado(tree: Tree){
    this.tree_selected = tree;  // obtengo el arbol que se ha elegido para ver
    // Recupero toda la info que hay de ese arbol en el servidor
    this.getInfoTree(this.tree_selected.id);
  }

  // Método que oculta la vista de todos los árboles
  onSubmit() { 
    this.submitted = true; 
  }

  volver(){
    let j=0;
    this.submitted = false;
    this.annotations.splice(0,this.annotations.length); // borro las anotaciones
    this.i = 0;
  }

  // Recojo el JSON con toda la información del árbol seleccionado
  getInfoTree(url: string){
    this.api.getInfoTree(url).subscribe(
      (data: any) =>{
        //this.nextUrl = data.nextPage.url;
        this.objInfoTree = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        //console.log(this.objInfoTree);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar la información del árbol seleccionado. Por favor, inténtelo de nuevo más tarde o recargue la página");
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
        this.sacarAnotaciones();

      }
      );
  }

  // Método que va recogiendo las url necesarias para recuperar cada anotacion del árbol
  sacarAnotaciones(){
    let i=0;
    for (let clave in this.objInfoTree){ 
      /********* POSITION *************/
      //si hay posicion validada, recupero los datos de la misma
      if(this.objInfoTree[clave][this.annot.AssertedPossition]){ 
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.AssertedPossition].value, true, false);
        //this.getInfoAnnot("http://localhost:8888/sta/data/annotation/p47-0036-A-1-1", true, false); //PROVISIONAL
        this.IsPossitionAsserted = true;
        // Si existe anotación Asserted, entonces la primaria coindice, por lo que solo compruebo la primaria
        // si no hay anotacion Asserted
      } else{
        if(this.objInfoTree[clave][this.annot.PrimaryPossition]){ //aqui se mete solo si no hay anotacion Asserted
          this.getInfoAnnot(this.objInfoTree[clave][this.annot.PrimaryPossition].value, false, true);
          //this.getInfoAnnot("http://localhost:8888/sta/data/annotation/p47-0036-A-1-1", false, true); //PROVISIONAL
        }
      }

      // Compruebo si hay otras anotaciones de posicion
      if(this.objInfoTree[clave][this.annot.Possition]){
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.Possition].value, false, false);
        //this.getInfoAnnot("http://localhost:8888/sta/data/annotation/004", false, false); //PROVISIONAL
      }

      /********* SPECIES *************/
      //si hay especie validada, recupero los datos de la misma
      if(this.objInfoTree[clave][this.annot.AssertedSpecies]){ 
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.AssertedSpecies].value, true, false);
        // Si existe anotación Asserted, entonces la primaria coindice
        this.IsSpeciesAsserted = true;
      } else{
        if(this.objInfoTree[clave][this.annot.PrimarySpecies]){ //aqui se mete solo si no hay anotacion Asserted
          this.getInfoAnnot(this.objInfoTree[clave][this.annot.PrimarySpecies].value, false, true);
        }
      }

      // Compruebo si hay otras anotaciones de posicion
      if(this.objInfoTree[clave][this.annot.Species]){
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.Species].value, false, false);
      }

      /********* IMAGEN *************/
      if(this.objInfoTree[clave][this.annot.Image]){
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.Image].value, false, false);
      } 
    }

  }

  getInfoAnnot(url: string, isAsserted: boolean, isPrimary: boolean){
    this.api.getAnnotation(url).subscribe(
      (data: any) =>{
        this.objAnnot = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        //console.log(this.objAnnot);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error_anot = true;
        alert("Ha habido un error al intentar cargar la información del árbol seleccionado. Por favor, inténtelo de nuevo más tarde o recargue la página");
        this.terminado_anot = true;
      },
      () =>{
        this.terminado_anot = true;
        this.convertirAnnot(isAsserted, isPrimary);
      }
      );
  }
    // creo un objeto TypeScritp de tipo Annotation[] con el objeto JSON devuelto para mostrarse en la pantalla adecuadamente
    convertirAnnot(isAsserted: boolean, isPrimary: boolean){
      let tipo: string;
      let date: string;
      let lat, long, especie;
      let creador;
      let imageURL;
  
      for (let clave in this.objAnnot){
        // Primero compruebo el tipo de anotacion que es
        switch (this.objAnnot[clave][this.annot.tipoAnnot].value){
          case "http://timber.gsic.uva.es/sta/ontology/PrimaryPosition":
            tipo = "location";
            lat = Number(this.objAnnot[clave][this.annot.buscadorLat].value);
            long = Number(this.objAnnot[clave][this.annot.buscadorLong].value);
            break;
          case "http://timber.gsic.uva.es/sta/ontology/AssertedSpecies":
            tipo = "specie";
            especie = this.objAnnot[clave][this.annot.buscador_taxon].value;
            break;
          case "http://timber.gsic.uva.es/sta/ontology/PrimarySpecies":
            tipo = "specie";
            especie = this.objAnnot[clave][this.annot.buscador_taxon].value;
            break;
          case "http://timber.gsic.uva.es/sta/ontology/ImageAnnotation":
              tipo = "image";
              imageURL = this.objAnnot[clave][this.annot.buscador_image].value;
              break;
          case "http://timber.gsic.uva.es/sta/ontology/PositionAnnotation":
              tipo = "location";
              lat = Number(this.objAnnot[clave][this.annot.buscadorLat].value);
              long = Number(this.objAnnot[clave][this.annot.buscadorLong].value);
              break;
          case "http://timber.gsic.uva.es/sta/ontology/SpeciesAnnotation":
              tipo = "specie";
              especie = this.objAnnot[clave][this.annot.buscador_taxon].value;
              console.log(especie);
              break;
        }
        
        // Recupero la fecha (si no tiene me la invento: las del ifn)
        if(!this.objAnnot[clave][this.annot.buscadorFecha]){
          date = "01/01/2020";
        } else{
          date = this.util.formatearFecha(this.objAnnot[clave][this.annot.buscadorFecha].value);
        }
        // Recupero el creador 
        if (this.objAnnot[clave][this.annot.buscador_creador].value == "http://crossforest.eu/ifn/ontology/")
        { 
          creador = "IFN"
        } else{
          creador = this.user.adaptarUsername(this.objAnnot[clave][this.annot.buscador_creador].value);
        }
        //creo la anotacion en funcion del tipo
        switch (tipo){
          case "location":
            this.annotations[this.i] = {id: clave, creator: creador, date: date, primary: isPrimary, asserted: isAsserted, type: {location: {lat: lat, long: long}}};
            break;
          case "specie":
            // Sustituyo la especie por el nombre vulgar
            for (let clav in this.SPECIES){
              if( especie == this.SPECIES[clav]["uri"]){
                especie = this.SPECIES[clav][this.annot.buscadorSpecies]["lits"].es;
                break;
              }
            }
            this.annotations[this.i] = {id: clave, creator: creador, date: date, primary: isPrimary, asserted: isAsserted, type: {specie: especie}};
            break;
          case "image":
            this.annotations[this.i] = {id: clave, creator: creador, date: date, primary: isPrimary, asserted: isAsserted, type: {image: imageURL}};
            break;
        }
        this.i++;
      }

    }





  


}
