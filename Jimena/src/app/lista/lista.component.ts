import { Component, OnInit, Input } from '@angular/core';
import {Tree} from '.././tree';
import { Annotation } from '.././Annotation';


@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada
  public tree_selected: Tree;
  public annotations: Annotation[]=[];


  constructor() { }

  ngOnInit(): void {
     //esto es de prueba.... luego lo obtendré con una consulta a la api
     this.annotations[0] = this.createAnnotation("http://timber.gsic.uva.es/sta/data/annotation/001", "Jimena", "28/04/2020", "./../assets/images/pino1.png", 41.8, -5, "Pino", "Acícula", "");
     this.annotations[1] = this.createAnnotation("http://timber.gsic.uva.es/sta/data/annotation/002", "Cristina", "27/04/2020", "./../assets/images/abeto1.png", 42, -5.012, "Pino", "Aguja", "Piñones");
  }
  //Variables de control -------------------------
  public submitted = false;


  //-------------------------------------------------------
  // método que  crea un objeto de tipo Annotation
  public createAnnotation(id: string, creator: string, date: string, image: string, lat: number, long: number, specie: string, hoja: string, fruto: string){
    let annot = { id: id, creator: creator, date: date, image: image, lat: lat, long: long, specie: specie, hoja: hoja, fruto: fruto};
    //console.log("Se ha creado la siguiente anotación: "+ annot.id +":"+annot.lat, annot.long);
    return annot;
  }
  // obtengo el id del árbol que se pinche para poder mostrar todas sus anotaciones asociadas
  obtenerIdSelecionado(tree: Tree){
    this.tree_selected = tree;
    //console.log(this.tree_selected.lat, this.tree_selected.long);
  }

  // Método que oculta la vista de todos los árboles
  onSubmit() { 
    this.submitted = true; 
  }

}
