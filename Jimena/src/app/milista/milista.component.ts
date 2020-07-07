/*                            MilistaComponent
     Elemento hijo de del componente MisAnotacionesComponent.
     Se encarga de la visualización de los árboles de un usuario, así como de redirigir a un usuario a la página
     para añadir una nueva anotación del árbol que se escoja
*/
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
//--------------------------------------------
import {Tree} from '.././tree';
import { Annotation } from '.././Annotation';
import { Image } from '../Image';
//----------------- SERVICES ---------------------------
import { APIService } from '../api.service';
import { UtilService } from './../services/util.service';
import { AnnotationService } from './../services/annotation.service';
import { UsersService } from '../services/users.service';
import { ImagesService } from '../services/images.service';
import { TreeService } from '../services/tree.service';

@Component({
  selector: 'app-milista',
  templateUrl: './milista.component.html',
  styleUrls: ['./milista.component.css']
})
export class MilistaComponent implements OnInit {

  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada
  @Input() SPECIES: object;

  //Variables de almacenamiento de datos -------------------------
  public tree_selected: Tree;
  public objInfoTree: object = [];
  public objAnnot: object = [];
  public objImage: object = [];
  public imageInfo: object = [];
  public annotations: Annotation[]=[];
  public imageAnnotations: Image[] = [];
  public IsPossitionAsserted: boolean = false; // Estas dos variables controlan si los datos son oficiales
  public IsSpeciesAsserted: boolean = false;   // para que se muestre una indicación en la interfaz

  //Variables de control -------------------------
  public submitted: boolean = false;
  public info: boolean = false;
  public error: boolean = false;
  public terminado: boolean = false;
  public error_anot: boolean = false;
  public errorImg: boolean = false;
  public terminado_anot: boolean = false;
  public i: number = 0; //controla el numero de anotaciones que tiene el árbol
  public registrado: boolean = false;

  constructor(private api: APIService, private util: UtilService, private annot: AnnotationService,
    private user: UsersService, private imageService: ImagesService, private treeServ: TreeService, private router: Router) { }

  

  ngOnInit(): void {
    // Control de si el usuario está registrado para mostrar alertas de registro
    this.registrado = this.user.comprobarLogIn();
  }

  /**
   * obtenerIdSelecionado: obtengo el árbol que se selecciona
   */
  public obtenerIdSelecionado(tree: Tree) {
    this.tree_selected = tree;
    // Guardo la url del árbol al que quiere añadir una nueva anotación en la sesión
    sessionStorage.setItem('urlTree', this.tree_selected.id);
    // El usuario si que está loggeado
    this.router.navigate(['/nuevaAnnot']);
  }

  /**
   * obtenerInfoSelect
   */
  public obtenerInfoSelect(tree: Tree) {
    this.tree_selected = tree;  // obtengo el arbol que se ha elegido para ver
    this.info = true;
    // Recupero toda la info que hay de ese arbol en el servidor
    this.getInfoTree(this.tree_selected.id);
    
  }

  /**
   * onSubmit: oculta la vista de todos los árboles
   */
  public onSubmit() {
    this.submitted = true; 
  }

  /**
   * volver
   */
  public volver() {
    let j=0;
    this.submitted = false;
    this.annotations.splice(0,this.annotations.length); // borro las anotaciones
    this.imageAnnotations.splice(0,this.imageAnnotations.length); // Borro las imágenes
    this.IsPossitionAsserted = false
    this.IsSpeciesAsserted = false;
    this.i = 0;
  }

  //------------------------------------------------------------------------------
   /**
   * getInfoTree: recupera el JSON con toda la información del árbol seleccionado
url: string   */
public getInfoTree(url: string) {
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
      this.sacarFecha(this.objInfoTree);
    }
    );
}


/**
 * sacarFecha
 */
public sacarFecha(infoTree: object) {
  for (let clave in infoTree){
    if(infoTree[clave][this.treeServ.buscadorFecha]){
      let fechaCompleta = infoTree[clave][this.treeServ.buscadorFecha].value;
      this.tree_selected.date = this.util.formatearFecha(fechaCompleta);
    }else{
      this.tree_selected.date = '1/01/2020'; // Los árboles del ifn no tienen fecha de creación
    }
  }
}

/**
 * sacarAnotaciones: va recogiendo las url necesarias para recuperar cada anotacion del árbol
 */
public sacarAnotaciones() {
  let i=0;
  for (let clave in this.objInfoTree){ 
    /********* POSITION *************/
    //si hay posicion validada, recupero los datos de la misma
    if(this.objInfoTree[clave][this.annot.AssertedPossition]){ 
      //console.log(this.objInfoTree[clave][this.annot.AssertedPossition].value);
      this.getInfoAnnot(this.objInfoTree[clave][this.annot.AssertedPossition].value, true, false);
      this.IsPossitionAsserted = true;
      // Si existe anotación Asserted, entonces la primaria coindice, por lo que no compruebo la primaria
      // si no hay anotacion Asserted
    } else{
      if(this.objInfoTree[clave][this.annot.PrimaryPossition]){ //aqui se mete solo si no hay anotacion Asserted
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.PrimaryPossition].value, false, true);
      }
    }

    // Compruebo si hay otras anotaciones de posicion
    if(this.objInfoTree[clave][this.annot.Possition]){
      if(this.objInfoTree[clave][this.annot.Possition].length == undefined){ // Solo hay una 
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.Possition].value, false, false);
      } else{
      for (let j=0; j<this.objInfoTree[clave][this.annot.Possition].length;j++){
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.Possition][j].value, false, false);
      }
    }
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

    // Compruebo si hay otras anotaciones de especie
    if(this.objInfoTree[clave][this.annot.Species]){
      if(this.objInfoTree[clave][this.annot.Species].length == undefined){ // Solo hay una 
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.Species].value, false, false);
      } else{
        for (let k=0; k<this.objInfoTree[clave][this.annot.Species].length;k++){
          this.getInfoAnnot(this.objInfoTree[clave][this.annot.Species][k].value, false, false);
        }
      }
      
    }

    /********* IMAGEN *************/
    // Cargo todas las anotaciones de imagen que hay --> tengo que diferenciar si solo hay 1
    if(this.objInfoTree[clave][this.annot.Image]){
      if(this.objInfoTree[clave][this.annot.Image].length == undefined){ // Solo hay una imagen
        this.getInfoAnnot(this.objInfoTree[clave][this.annot.Image].value, false, false);
      } else{
        for (let k=0; k<this.objInfoTree[clave][this.annot.Image].length;k++){
          this.getInfoAnnot(this.objInfoTree[clave][this.annot.Image][k].value, false, false);
        }
      }
    } 
  }
}

/**
 * getInfoAnnot
 */
public getInfoAnnot(url: string, isAsserted: boolean, isPrimary: boolean) {
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

/**
 * convertirAnnot: crea un objeto TypeScritp de tipo Annotation[] con el objeto JSON devuelto 
 */
public convertirAnnot(isAsserted: boolean, isPrimary: boolean) {
    let tipo: string;
    let date: string;
    let lat, long, especie;
    let creador;
    let imageURL;
    let hayErrorImg = false;

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
            this.getImageInfo(imageURL);
            
            break;
        case "http://timber.gsic.uva.es/sta/ontology/PositionAnnotation":
            tipo = "location";
            lat = Number(this.objAnnot[clave][this.annot.buscadorLat].value);
            long = Number(this.objAnnot[clave][this.annot.buscadorLong].value);
            break;
        case "http://timber.gsic.uva.es/sta/ontology/SpeciesAnnotation":
            tipo = "specie";
            especie = this.objAnnot[clave][this.annot.buscador_taxon].value;
            //console.log(especie);
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
      //console.log(this.annotations[this.i]);
      this.i++;
    }

  }


  /**
   * getImageInfo
   */
  public getImageInfo(imageUrl: string) {
    this.api.getAnnotImage(imageUrl).subscribe(
      (data: any) =>{
        this.objImage = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
        let image = this.imageService.crearImage(this.objImage, imageUrl);
        this.imageAnnotations.push(image);
        //console.log(this.imageAnnotations);
      },
      (error) =>{
        //console.error(error); // si se ha producido algún error
        if (error.status == 404){
          console.log("Error al cargar la información de la imagen "+imageUrl);
          //alert("No se ha podido encontrar una de las imágenes del árbol");
        }else{
          this.errorImg = true;
        }
      },
      () =>{ 

      }
      ); 
  }

}
