import { Component, OnInit } from '@angular/core';
import { Annotation } from '../Annotation';
//------------------- SERVICIOS -----------------------------
import { UsersService } from './../services/users.service';
import { SpeciesService } from '../services/species.service';
import { APIService } from '../api.service';
import { AnnotationService } from '../services/annotation.service';
import { UtilService } from '../services/util.service';
import { ImagesService } from '../services/images.service';



@Component({
  selector: 'app-add-annot',
  templateUrl: './add-annot.component.html',
  styleUrls: ['./add-annot.component.css']
})
export class AddAnnotComponent implements OnInit {

  public urlTree: string;
  public urlUser: string = 'http://timber.gsic.uva.es/sta/data/user/';
  public basicAuth: string;

  objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  ESPECIES: Array<string> = [];


  //--------------------------------
  // Variables recogidas en el formulario
  tipo: Array<string> = ["Imagen", "Ubicación", "Especie"];
  type: string;
  imagen: string;
  lat: number;
  long: number;
  especie: string;
  title: string;
  description: string;
  PARTES: Array<string> = [];
  depicts: string;
  imageSrc_default: string = "./../assets/images/no-image.png";
  imageSrc: string; //Para la previsualizacion de la imagen al subirla
  base64: string; // guarda la codificacion de la imagen




 //-----------------------------------
 // Variables de control
  submitted: boolean = false;
  submitted2: boolean = false;
  errorCreacion: boolean = false;
  mensajeError: string;
  terminado: boolean = false;
 //-----------------------------------

  constructor(private UsersService: UsersService, private SpeciesService: SpeciesService, private api: APIService,
    private annotServ: AnnotationService, private util: UtilService, private imageServ: ImagesService) { }

  ngOnInit(): void {
    // Cargo las especies
    this.getSpecies(); // cargo las especies disponibles para ponerlas en el formulario

    this.PARTES = this.imageServ.PARTES;


    // Obtengo la url del árbol al que se va  a añadir la anotacion
    this.urlTree = sessionStorage.getItem('urlTree');
    console.log(this.urlTree);

    // Recojo el username para crear la url del usuario
    let username = this.UsersService.getSessionName();
    this.urlUser = this.urlUser+username; // url completa: http://timber.gsic.uva.es/sta/data/user/username

    // Guardo la autenticación del usuario
    this.basicAuth = this.UsersService.getUserAutentication();

  }

   // Cargo todas las especies disponibles del sistema
   public getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
        this.ESPECIES = this.SpeciesService.cargarEspecies(this.objSpecies); 
        //console.log(this.objSpecies);
      },
      (error) =>{
        console.error(error); // si se ha producido algún error
        alert("Ha habido un error al intentar cargar las especies del sistema. Inténtelo de nuevo más tarde");
      },
      () =>{  
      }
      );
  }

  //-------------------------------------
  public onSubmit(){
    this.submitted = true;
  }
  public onSubmit2(){
    this.crearAnotacion();
    this.submitted2 = true;
    //console.log(this.newAnnot);
  }
  
  /**
   * volver: acción que vuelve al formulario de elegir el tipo de anotación
   */
  public volver() {
    this.borrarDatos();
    this.submitted = false;
  }
  
  /**
   * borrarDatos: método que borra los datos introducidos por el usuario
   */
  public borrarDatos() {
    this.lat = null;
    this.long = null;
    this.especie = null;
    this.imagen = null;
    this.base64 = null;
    this.title = null;
    this.depicts = null;
    this.description = null;
    this.imageSrc = null;
  }

  /**
   * crearAnotacion
   */
  public crearAnotacion() {
    let datos = this.crearJSON();
    console.log("Se va a crear la anotación...");
    
    // POST a la api
    this.annotServ.createAnnot(datos, this.basicAuth).subscribe(
      (data) =>{
        console.log(data);
      },
      (error) =>{
        console.error(error);
        if(error.status != 201){
          this.errorCreacion = true;
          this.mensajeError = this.util.crearMensajeError(error.status);
        }
        this.terminado = true;
      },
      () =>{
        this.terminado = true;
      }
      );

    // Tras mandar los datos al servidor, limpio las variables del formulario por si se crea otro
    this.type = null;
    this.long = null;
    this.especie = null;
    this.imagen = null;
    
  }

  /**
   * crearJSON
   */
  public crearJSON(): string {
    let arrayAnot: Object;
    // Diferencio el tipo de anotacion que se ha seleccionado
    switch (this.type){
      case 'Especie': 
        let especie_select = this.SpeciesService.buscarUri(this.objSpecies, this.especie);
        arrayAnot = {creator: this.urlUser, id: this.urlTree, type: "species", species: especie_select};
        break;
      case 'Ubicación': 
        arrayAnot = {creator: this.urlUser, id: this.urlTree, type: "position", lat: this.lat, long: this.long};
        break;
      case 'Imagen': 
        arrayAnot = {creator: this.urlUser, id: this.urlTree, type: "image", image: this.base64};
        break;
    }   

    return JSON.stringify(arrayAnot);
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
