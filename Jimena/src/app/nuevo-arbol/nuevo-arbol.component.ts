/*                            NuevoArbolComponent
     Componente que se encarga de recoger mediante un formulario los datos para crear un árbol:
     - Localización (obligatorio)
     - Imagen (tamaño máximo de 10MB)
     - Especie
     Además, crea el árbol (POST a la api del servidor)
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//-----------------------------------------------------
import { Tree_complete } from '../tree_complete';
//------------------- SERVICIOS -----------------------------
import { APIService} from '../api.service';
import { UtilService } from '../services/util.service';
import { SpeciesService } from '../services/species.service';
import { ImagesService } from '../services/images.service';
import { UsersService } from './../services/users.service';
//-------------------------------------------------

@Component({
  selector: 'app-nuevo-arbol',
  templateUrl: './nuevo-arbol.component.html',
  styleUrls: ['./nuevo-arbol.component.css']
})
export class NuevoArbolComponent implements OnInit {

  // ESPCIES **************************
  public objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  public ESPECIES: Array<string> = [];

  // Variables para recoger los datos del cuestionario
  public newTree: Tree_complete;
  public lat: number;
  public long: number;
  public especie: string;
  public hoja: string;
  public fruto: string;
  public imagen: string;
  public fecha: string;

  // DATOS DE LA SESIÓN
  public basicAuth: string;
  public creador:string = 'http://timber.gsic.uva.es/sta/data/user/';
  

  //variables de control de la interfaz
  public submitted: boolean = false;
  public confirmacion: boolean = false;
  public mensajeError: string;
  public error: boolean = false; // controla especies
  public terminado: boolean = false;
  public terminado2: boolean = false; // controla creacion arboles
  public error2: boolean = false;

  // Imágenes
  public base64: string; // guarda la codificacion de la imagen
  public title: string;
  public description: string;
  public depicts: string;
  public imageSrc: string; //Para la previsualizacion de la imagen al subirla
  public imageSrc_default: string = "./../assets/images/no-image.png"; // imagen por defecto
  public PARTES: Array<string> = []; // partes de la imagen

  constructor(private api: APIService, private UtilService: UtilService, private SpeciesService: SpeciesService,
    private ImagesService: ImagesService, private UsersService: UsersService, private router: Router) { }

  ngOnInit(): void {
    // Compruebo si hay autenticación de usuario para que no se pueda acceder sin estar registrado
    if(!this.UsersService.comprobarLogIn()){
      this.router.navigate(['/inicio_sesion']); // el usuario no está loggeado, le mando a que inicie sesión
    } else{
      // El usuario si que está loggeado
      // Recojo el username para crear la url del usuario
      let username = this.UsersService.getSessionName();
      this.creador = this.creador+username; // url completa: http://timber.gsic.uva.es/sta/data/user/username

      // Guardo la autenticación del usuario
      this.basicAuth = this.UsersService.getUserAutentication();

      // cargo las especies disponibles para ponerlas en el formulario
      this.getSpecies(); 
      this.PARTES = this.ImagesService.PARTES;
      }
  }

  /**
   * onSubmit: pasa a la página de confirmar si crear el nuevo árbol
   */
  public onSubmit() {
    this.submitted = true;
    this.fecha = this.UtilService.construirFecha(); 
  }
  /**
   * onSubmit2: pasa a la página que indica si se ha creado correctamente o ha habido error
   */
  public onSubmit2() {
    this.confirmacion = true;
  }

  /**
   * volver: vuelve al formulario CON los datos que se han introducido
   */
  public volver() {
    this.submitted = false;
  }

  /**
   * borrarDatos: borra los datos introducidos por el usuario y vuelve al formulacio de nuevo árbol
   */
  public borrarDatos() {
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
        this.error = true;
        alert("Ha habido un error al intentar cargar las especies del sistema. Inténtelo de nuevo más tarde");
        this.terminado = true;
      },
      () =>{  
        this.terminado = true;
      }
      );
  }
  
  /**
   * createTree: manda la informacion al servidor
   */
  public createTree() {
    this.createJsonTree(); // Creo el JSON con los datos necesarios
    console.log("Se va a crear el árbol...");
    
    // POST a la api
    this.api.createTree(JSON.stringify(this.newTree), this.basicAuth).subscribe(
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

  /**
   * createJsonTree
   */
  public createJsonTree() {
    let si = false;
    
    // creo el campo depics para no tener que repetir codigo en los if
    if (this.depicts != null){
      // Creo el campo de depics
      this.depicts = this.ImagesService.createUriDepicts(this.depicts);
      //console.log(this.depicts);
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

  /**
   * getPosicion
   */
  public getPosicion() {
    // Compruebo si el navegador dispone de la api de geolocalización
    if (navigator.geolocation) {
      // ¡Excelente, el API puede ser utilizado!
      navigator.geolocation.getCurrentPosition((position)=>{ 
        //console.log("Found your location nLat : "+position.coords.latitude+" nLang :"+ position.coords.longitude);
        this.lat = position.coords.latitude;
        this.long = position.coords.longitude;
    });
   } else {
      console.log("Tu navegador no permite obtener tu posición actual");
    } 
  }

  /*********************** IMAGEN *******************/
  /**
   * selectFile: almacena la imagen escogida y la codifica en base64
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
   * codeFile: codifica la imagen en base64 y comprueba que no supera los 10MB
   */
  public codeFile(event) {
    var binaryString = event.target.result;
    this.base64= btoa(binaryString);
    
    // Compruebo si la imagen ocupa menos de 10 Mb
    if (this.base64.length > 10000000){
      alert("La imagen seleccionada ocupa demasiado. Por favor, comprímala para que ocupe menos");
      this.base64 = null;
      this.imagen = null;
      this.imageSrc = null;
    }
  }

}
