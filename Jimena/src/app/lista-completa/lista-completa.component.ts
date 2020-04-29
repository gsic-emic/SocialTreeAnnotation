import { Component, OnInit, Input } from '@angular/core';
import { Tree } from './../tree';
import { Annotation } from '../Annotation';


@Component({
  selector: 'app-lista-completa',
  templateUrl: './lista-completa.component.html',
  styleUrls: ['./lista-completa.component.css']
})
export class ListaCompletaComponent implements OnInit {

  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada

  constructor() { }

  ngOnInit(): void {
    //esto es de prueba.... luego lo obtendré con una consulta a la api
    this.annotations[this.i] = this.createAnnotation("http://timber.gsic.uva.es/sta/data/annotation/001", "Jimena", "28/04/2020", "./../assets/images/pino1.png", 41.8, -5, "Pino", "Acícula", "");
    this.i++;
    this.annotations[this.i] = this.createAnnotation("http://timber.gsic.uva.es/sta/data/annotation/002", "Cristina", "27/04/2020", "./../assets/images/abeto1.png", 42, -5.012, "Pino", "Aguja", "Piñones");
    console.log(this.annotations);
  }

  // Variables para el control del formulario
  public submitted2: boolean = false;
  public validar: boolean = false;
  public i: number = 0;
  //---------------------------------------

  // Variables para almacenar los datos provenientes de la consulta
  public treeSelected: Tree;
  public annotations: Annotation[]=[]; // anotaciones que pertenecen al árbol seleccionado

  public id: string;
  public creator: string;
  public date: string;
  public image: string;
  public lat: number;
  public long: number;
  public specie: string;
  public hoja: string;
  public fruto: string;
  //---------------------------------------
  // método que  crea un objeto de tipo Tree
  public createAnnotation(id: string, creator: string, date: string, image: string, lat: number, long: number, specie: string, hoja: string, fruto: string){
    let annot = { id: id, creator: creator, date: date, image: image, lat: lat, long: long, specie: specie, hoja: hoja, fruto: fruto};
    //console.log("Se ha creado la siguiente anotación: "+ annot.id +":"+annot.lat, annot.long);
    return annot;
  }

  // una vez que se el árbol seleccionado, tendré que realizar una consulta para averiguar todas las anotaciones
    //  que tiene para mostrarlas
    // -----> de momento las meto a mano.... pero esto queda pendiente!

  public onSubmit() { 
    this.submitted2 = true; 
  }
  public obtenerIdSelecionado(tree: Tree){
    this.treeSelected = tree;
  }
  public obtenerIdSelecionado_validar(tree: Tree){
    this.treeSelected = tree;
    this.validar = true;
  }
  public volver(){
    this.submitted2 = false;
    this.validar = false;
  }


}
