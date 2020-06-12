import { Component, OnInit } from '@angular/core';
import { Tree_complete } from '../tree_complete';
//------------------- SERVICIOS -----------------------------
import { APIService} from '../api.service';
import { UtilService } from '../services/util.service';
import { SpeciesService } from '../services/species.service';
import { ImagesService } from '../services/images.service';
//-------------------------------------------------
//import {EXIF as exifShim, EXIFStatic } from '../../../node_modules/exif-js/exif';

//declare var EXIF : EXIFStatic;

@Component({
  selector: 'app-nuevo-arbol',
  templateUrl: './nuevo-arbol.component.html',
  styleUrls: ['./nuevo-arbol.component.css']
})
export class NuevoArbolComponent implements OnInit {

  // ESPCIES **************************
  objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  ESPECIES: Array<string> = [];

  // Variables para recoger los datos del cuestionario
  newTree: Tree_complete;
  lat: number;
  long: number;
  especie: string;
  hoja: string;
  fruto: string;
  imagen: string;
  creador:string = "demo";
  fecha: string;
  

  //variables de control
  submitted: boolean = false;
  confirmacion: boolean = false;
  mensajeError: string;
  error: boolean = false; // controla especies
  terminado: boolean = false;
  terminado2: boolean = false; // controla creacion arboles
  error2: boolean = false;

  // Imágenes
  base64: string; // guarda la codificacion de la imagen
  title: string;
  description: string;
  PARTES: Array<string> = ["Parte del árbol", "Tronco", "Otra parte", "Hoja", "Vista general", "Fruto", "Flor", "Copa", "Rama"]
  depicts: string;
  imageSrc: string; //Para la previsualizacion de la imagen al subirla
  imageSrc_default: string = "./../assets/images/no-image.png";
  //metadata: Array<any>;
  //date_img: string;
  //lat_img: number;
  //long_img: number;
  //width: number;
  //heigth: number;

  constructor(private api: APIService, public UtilService: UtilService, public SpeciesService: SpeciesService,
    public ImagesService: ImagesService) { }

  ngOnInit(): void {
    this.getSpecies(); // cargo las especies disponibles para ponerlas en el formulario

  }


  // método que pasa a la página para confirmar la nueva anotación
  public onSubmit() { 
    this.submitted = true;
    this.fecha = this.UtilService.construirFecha(); 
  }
  public onSubmit2(){
    this.confirmacion = true;
  }

  //acción que vuelve al formulario CON los datos que se han introducido
  volver(){
    this.submitted = false;
  }

  //método que borra los datos introducidos por el usuario y vuelve al formulacio de nueva anotación
  public borrarDatos(){
    this.lat = null;
    this.long = null;
    this.especie = null;
    this.imagen = null;
    this.title = null;
    this.description = null;
    this.depicts = null;
    this.error2 = null;
    this.imageSrc = null;

    this.volver();
    this.confirmacion = false;
  }

   // Cargo todas las especies disponibles del sistema
   getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
        this.ESPECIES = this.SpeciesService.cargarEspecies(this.objSpecies); 
        //console.log(this.objSpecies);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        this.error = true;
        alert("Ha habido un error al intentar cargar las especies del sistema. Inténtelo de nuevo más tarde");
        this.terminado = true;
      },
      () =>{  
        this.terminado = true;
      }
      );
  }

  
  // Metodo que manda la informacion al servidor
  public createTree(){
    this.createJsonTree(); // Creo el JSON con los datos necesarios
    console.log("Se va a crear el árbol...");
    
    // POST a la api
    this.api.createTree(JSON.stringify(this.newTree)).subscribe(
      (data) =>{
        console.log(data);
      },
      (error) =>{
        this.error2 = true;
        console.error(error);
        this.mensajeError = this.UtilService.crearMensajeError(error.status);
        this.terminado2 = true;
      },
      () =>{
        this.terminado2 = true;
      }
      );

    // Tras mandar los datos al servidor, limpio las variables del formulario por si se crea otro
    this.lat = null;
    this.long = null;
    this.especie = null;
    this.imagen = null;
  }


  createJsonTree(){
    let si = false;
    
    // creo el campo depics para no tener que repetir codigo en los if
    if (this.depicts != null){
      // Creo el campo de depics
      this.depicts = this.ImagesService.createUriDepicts(this.depicts);
      console.log(this.depicts);
    }
    // Compruebo si rellena todos los campos
    if (this.especie != null && this.imagen != null){
      let especie_select;
      si = true;
      especie_select = this.SpeciesService.buscarUri(this.objSpecies, this.especie);
      this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, image: this.base64, species: especie_select, title: this.title, description: this.description, depicts: this.depicts};

    } else{
      if (this.especie != null){
        let especie_select;
        si = true;
        especie_select = this.SpeciesService.buscarUri(this.objSpecies, this.especie);
        this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, species: especie_select };

      } else if (this.imagen != null){
        si = true;
        this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, image: this.base64, title: this.title, description: this.description, depicts: this.depicts};
        
      }
    }
      
    // Si no se ha metido en ninguna condicion anterior, es que solo ha metido la lat y lon
    if(!si){
      // Solo ha metido la localización 
      this.newTree = {creator:  this.creador, lat: this.lat, long: this.long};
    }
    
    //console.log(JSON.stringify(this.newTree));

  }

  /******* Conversión de las imágenes a base64 para madar al servidor */
  selectFile(event){
    var files = event.target.files;
    var file = files[0];

    if (files && file) {
        var reader = new FileReader();
        reader.onload = this.codeFile.bind(this); // codificacion base64
        reader.readAsBinaryString(file);

        var reader2 = new FileReader();
        reader2.onload = (e: any) => {
          this.imageSrc = e.target.result; // Previsualizacion de la imagen subida
        };
        reader2.readAsDataURL(event.target.files[0]);
       
      // Extraigo los metadatos de la imagen
      /*this.setDataImage(file).then((exifdata) => {
        Object.keys(exifdata).forEach((prop) => {
          if(prop != undefined){
              metadata[prop] = exifdata[prop];
          }
        });
      });
      console.log(metadata);
      this.convertirMetadata(metadata);*/
    }
  }


codeFile(event) {
    var binaryString = event.target.result;
    this.base64= btoa(binaryString);
    //console.log(this.base64);
    
    // Compruebo si la imagen ocupa menos de 10 Mb
    if (this.base64.length > 10000000){
      alert("La imagen seleccionada ocupa demasiado. Por favor, comprímala para que ocupe menos");
      this.base64 = null;
      this.imagen = null;
      this.imageSrc = null;
    }
  }

}
