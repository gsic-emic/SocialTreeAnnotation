/*                            AddAnnotComponent
     Componente que se encarga de crear anotaciones de tipo:
     - Imagen
     - Especie
     - Localización
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  public username: string;
  public basicAuth: string;

  public objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  public ESPECIES: Array<string> = [];


  //--------------------------------
  // Variables recogidas en el formulario
  public tipo: Array<string> = ["Imagen", "Ubicación", "Especie"];
  public type: string;
  public imagen: string;
  public lat: number;
  public long: number;
  public especie: string;
  public date: string;
  public title: string;
  public description: string;
  public PARTES: Array<string> = [];
  public depicts: string;
  public imageSrc_default: string = "./../assets/images/no-image.png";
  public imageSrc: string; //Para la previsualizacion de la imagen al subirla
  public base64: string; // guarda la codificacion de la imagen

 //-----------------------------------
 // Variables de control
 public submitted: boolean = false;
 public submitted2: boolean = false;
 public errorCreacion: boolean = false;
 public mensajeError: string;
 public terminado: boolean = false;
 public isImage: boolean = false;
 public isSpecie: boolean = false;
 public isLocation: boolean = false;
 //-----------------------------------

  constructor(private UsersService: UsersService, private SpeciesService: SpeciesService, private api: APIService,
    private annotServ: AnnotationService, private util: UtilService, private imageServ: ImagesService,
    private router: Router) { }

  ngOnInit(): void {
    // Compruebo si hay autenticación de usuario para que no se pueda acceder sin estar registrado
    if(!this.UsersService.comprobarLogIn()){
      this.router.navigate(['/inicio_sesion']); // el usuario no está loggeado, le mando a que inicie sesión
    } else{
      // El usuario si que está loggeado


      // Cargo las especies
      this.getSpecies(); // cargo las especies disponibles para ponerlas en el formulario
      this.PARTES = this.imageServ.PARTES;

      // Obtengo la url del árbol al que se va  a añadir la anotacion
      this.urlTree = sessionStorage.getItem('urlTree');
      console.log(this.urlTree);

      // Recojo el username para crear la url del usuario
      this.username = this.UsersService.getSessionName();
      this.urlUser = this.urlUser+this.username; // url completa: http://timber.gsic.uva.es/sta/data/user/username

      // Guardo la autenticación del usuario
      this.basicAuth = this.UsersService.getUserAutentication();
      }
  }
//--------------------------------------------------------------------

  /**
   * getSpecies: Carga todas las especies disponibles del sistema
   */
  public getSpecies() {
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

  //---------------------------------------------------------
  /**
   * onSubmit
   */
  public onSubmit() {
    this.submitted = true;
  }
  /**
   * onSubmit2
   */
  public onSubmit2() {
    this.crearAnotacion();
    this.submitted2 = true;
    this.date = this.util.construirFecha();
  }
  
  /**
   * volver: acción que vuelve al formulario de elegir el tipo de anotación
   */
  public volver() {
    this.borrarDatos();
    this.submitted = false;
  }

  /**
   * cancelar
   */
  public cancelar() {
    // Borro de la sesión el id del árbol
    this.util.borrarItemSesion('urlTree');
    // Vuelvo a la página anterior
    window.history.back(); 
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
    this.isImage = false;
    this.isSpecie = false;
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
    
  }

  /**
   * crearJSON
   */
  public crearJSON(): string {
    let arrayAnot: Object;
    // Diferencio el tipo de anotacion que se ha seleccionado
    switch (this.type){
      case 'Especie': 
        this.isSpecie = true;
        let especie_select = this.SpeciesService.buscarUri(this.objSpecies, this.especie);
        arrayAnot = {creator: this.urlUser, id: this.urlTree, type: "species", species: especie_select};
        break;
      case 'Ubicación': 
      this.isLocation = true;
        arrayAnot = {creator: this.urlUser, id: this.urlTree, type: "position", lat: this.lat, long: this.long};
        break;
      case 'Imagen': 
      this.isImage = true;
        arrayAnot = {creator: this.urlUser, id: this.urlTree, type: "image", image: this.base64};
        break;
    }   

    return JSON.stringify(arrayAnot);
  }

  /***************** ANOTACIÓN DE IMAGEN  *********************/
  /**
   * selectFile: Conversión de las imágenes a base64 para madar al servidor
   */
  public selectFile(event) {
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
  /**
   * codeFile
   */
  public codeFile(event) {
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
