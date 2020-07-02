/*                            MisAnotacionesComponent
     Componente que se encarga de recuperar del servidor todos los árboles y anotaciones del usuario que ha
     inicado sesión y los muestra en la interfaz
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import * as $ from 'jquery';
//-----------------------------------------------------
import { Tree} from '.././tree';
import { Annotation } from '../Annotation';
import { Image } from '../Image';
//------------------- SERVICIOS -----------------------------
import { APIService} from '../api.service';
import { AnnotationService } from './../services/annotation.service';
import { UtilService } from './../services/util.service';
import { TreeService } from './../services/tree.service';
import { UsersService } from './../services/users.service';
import { SpeciesService } from '../services/species.service';
import { ImagesService } from '../services/images.service';

declare var $: any; 
@Component({
  selector: 'app-mis-anotaciones',
  templateUrl: './mis-anotaciones.component.html',
  styleUrls: ['./mis-anotaciones.component.css']
})
export class MisAnotacionesComponent implements OnInit {

  // Variables de control -----------------------
  public arboles: boolean = true;
  public existen: boolean = true; // variable que controla si el usuario tiene arboles creados
  public existen_anot: boolean = true;
  public error: boolean = false;
  public error_anot: boolean = false;
  public terminado: boolean = false;
  public terminado_species: boolean = false;
  public terminado_anot: boolean = false;
  public user: string;

  // Variables de almacenamiento de los datos recuperados------------------------
  public objSpecies: object[]=[];
  public objTrees: Tree[]; // Objeto JSON que almacena todos los árboles devueltos
  public trees: Tree[]=[]; // Array con todos los árboles del sistema con formato adecuado para visualización
  public objAnnotations: Annotation[] = []; // Objeto JSON que almacena todas las anotaciones del usuario
  public annotations: Annotation[] = []; // datos de las anotaciones modelados
  public objImage: object = [];
  public imageAnnotations: Image[] = [];
  

  constructor(private api: APIService, private annot: AnnotationService, private util: UtilService,
    private tree: TreeService, private userService: UsersService, private router: Router, 
    private SpeciesService:SpeciesService, private ImagesService: ImagesService) { }

  ngOnInit(): void {
    // Compruebo si hay autenticación de usuario para que no se pueda acceder sin estar registrado
    if(!this.userService.comprobarLogIn()){
      this.router.navigate(['/inicio_sesion']); // el usuario no está loggeado, le mando a que inicie sesión
    } else{
      // El usuario si que está loggeado
      // Recojo el username 
      this.user = this.userService.getSessionName();

      this.getSpecies();
      this.getMyAnnotatios(this.user);

      }

      $(document).ready(function() {
        $('#volver-arriba').click(function(){
          $('html, body').animate({scrollTop:0}, 'slow');
          return false;
        });
      });
  }
   
  /****************************** SPECIES **************************/
  /**
   * getSpecies
   */
  public getSpecies() {
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
  /**
   * getMyTrees
   */
  public getMyTrees(user: string) {
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
    /**
     * getMyAnnotatios
     */
    public getMyAnnotatios(user: string) {
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

  /**
    * convertirAnnot: crea un objeto TypeScritp de tipo Annotation[] con el objeto JSON devuelto 
  */
  public convertirAnnot() {
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
        case "http://timber.gsic.uva.es/sta/ontology/PrimarySpecies":
          tipo = "specie";
          especie = this.objAnnotations[clave][this.annot.buscador_taxon].value;
          break;
        case "http://timber.gsic.uva.es/sta/ontology/ImageAnnotation":
            tipo = "image";
            image = this.objAnnotations[clave][this.annot.buscador_image].value;
            this.getImageInfo(image);
            //console.log(image);
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
          // Sustituyo la especie por el nombre vulgar
          let vulgarName = this.SpeciesService.adaptarNombreVulgar(this.objSpecies, especie);
          this.annotations[i] = {id: clave, creator: this.user, date: date, primary: primary, asserted: asserted, type: {specie: vulgarName}};
          break;
        case "image":
          this.annotations[i] = {id: clave, creator: this.user, date: date, primary: primary, asserted: asserted, type: {image: image}};
          break;
      }
      i++;
    }
    console.log(this.annotations);
  }

   /**
     * getImageInfo
     */
    public getImageInfo(imageUrl: string) {
      this.api.getAnnotImage(imageUrl).subscribe(
        (data: any) =>{
          this.objImage = data.response; // si la consulta se realiza con éxito, guardo los datos que me devuelve
          let image = this.ImagesService.crearImage(this.objImage, imageUrl);
          this.imageAnnotations.push(image);
          //console.log(this.imageAnnotations);
        },
        (error) =>{
          console.error(error); // si se ha producido algún error
          alert("Ha habido un error al intentar cargar la información de las imágenes.");
        },
        () =>{ 

        }
        );    
    }

 
}
