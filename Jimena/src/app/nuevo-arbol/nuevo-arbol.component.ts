import { Component, OnInit } from '@angular/core';
import { Tree_complete } from '../tree_complete';
import { APIService} from '../api.service';


@Component({
  selector: 'app-nuevo-arbol',
  templateUrl: './nuevo-arbol.component.html',
  styleUrls: ['./nuevo-arbol.component.css']
})
export class NuevoArbolComponent implements OnInit {

  // ESPCIES **************************
  error: boolean = false;
  terminado: boolean = false;
  objSpecies: object[]=[]; // Objeto JSON que almacena todas las especies/familias/generos existentes
  ESPECIES: Array<string> = [];
  buscadorSpecies: string = "http://crossforest.eu/ifn/ontology/vulgarName";
  buscadorUri: string = "uri";

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
  base64: string; // guarda la codificacion de la imagen

  //variables de control
  public submitted: boolean = false;
  public confirmacion: boolean = false;

  constructor(private api: APIService) { }

  ngOnInit(): void {
    this.getSpecies(); // cargo las especies disponibles para ponerlas en el formulario
  }


  // método que pasa a la página para confirmar la nueva anotación
  public onSubmit() { 
    this.submitted = true;
    this.fecha = this.construirFecha();
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
    //this.hoja = null;
    this.imagen = null;
    //this.fruto = null;

    this.volver();
    this.confirmacion = false;
  }

   // Cargo todas las especies disponibles del sistema
   getSpecies(){
    this.api.getSpecies().subscribe(
      (data: any) =>{
        this.objSpecies = data.response;
        this.cargarEspecies();
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
  cargarEspecies(){
    var i=0;
    for (let clave in this.objSpecies){     
      if (this.objSpecies[clave]["nivel"]== 0){ // Las especies son de nivel 0
        this.ESPECIES[i] = this.objSpecies[clave][this.buscadorSpecies]["lits"].es;
        i++;
      }
    }
  }
  
  //contstruyo el arbol, lo convierto a JSON y hago un POST a la api
  public createTree(){
    let si = false;
    // Compruebo si rellena todos los campos
    if (this.especie != null && this.imagen != null){
      let especie_select;
      si = true;
      for (let clave in this.objSpecies){
        if (this.objSpecies[clave]["nivel"]== 0){
          if (this.objSpecies[clave][this.buscadorSpecies]["lits"].es == this.especie){ 
            especie_select = clave;
            break;
          }
        }
      }
      this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, image: this.base64, species: especie_select };

    } else{
      if (this.especie != null){
        si = true;
        // Busco la uri de la especie seleccionada para mandarla al servidor
        for (let clave in this.objSpecies){
          if (this.objSpecies[clave]["nivel"]== 0){
            if (this.objSpecies[clave][this.buscadorSpecies]["lits"].es == this.especie){ 
              this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, species: clave };
              break;
            }
          }
        }
      } else if (this.imagen != null){
        si = true;
        this.newTree = {creator:  this.creador, lat: this.lat, long: this.long, image: this.base64};
        
      }
    }
      
    // Si no se ha metido en ninguna condicion anterior, es que solo ha metido la lat y lon
    if(!si){
      // Solo ha metido la localización 
      this.newTree = {creator:  this.creador, lat: this.lat, long: this.long};
    }
    
    console.log(JSON.stringify(this.newTree));
    // POST a la api
    this.api.createTree(JSON.stringify(this.newTree)).subscribe(
      (data) =>{
        console.log(data);
      },
      (error) =>{
        console.error(error);
      },
      () =>{
      }
      );

    // Tras mandar los datos al servidor, limpio las variables del formulario por si se crea otro
    this.lat = null;
    this.long = null;
    this.especie = null;
    this.imagen = null;
  }

  /******* Conversión de las imágenes a base64 para madar al servidor */
  selectFile(event){
    var files = event.target.files;
    var file = files[0];

    if (files && file) {
        var reader = new FileReader();
        reader.onload =this.codeFile.bind(this);
        reader.readAsBinaryString(file);
    }
  }

codeFile(event) {
    var binaryString = event.target.result;
    this.base64= btoa(binaryString);
    //console.log(this.base64);
  }

  //-----------------------------------------------------
  
  public construirFecha(): string{
    var f = new Date();
    var fecha;
    return fecha = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
  }
  public onSubmit2(){
    this.confirmacion = true;
  }


}
