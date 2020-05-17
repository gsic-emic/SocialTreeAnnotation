import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tree } from './../tree';
import { Annotation } from '../Annotation';


@Component({
  selector: 'app-lista-completa',
  templateUrl: './lista-completa.component.html',
  styleUrls: ['./lista-completa.component.css']
})
export class ListaCompletaComponent implements OnInit {

  // Componente hijo del componente búsqueda
  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada

  // Variable que quiero mandar al padre para ocultar el filtro cuando se pulse algún botón
  @Output() filtro = new EventEmitter<boolean>();
  //----------------------------------

  constructor() { }

  ngOnInit(): void {
    //esto es de prueba.... luego lo obtendré con una consulta a la api
    this.annotations[0] = {id: "http://timber.gsic.uva.es/sta/data/annotation/003", creator: "Jimena", date: "27/04/2020", type: {specie: "Pino"}};
    this.annotations[1] = {id: "http://timber.gsic.uva.es/sta/data/annotation/004", creator: "Juan", date: "20/04/2020", type: {hoja: "Acícula"}};
    this.annotations[2] = {id: "http://timber.gsic.uva.es/sta/data/annotation/005", creator: "Maria", date: "06/05/2020", type: {fruto: "Castaña"}};



    console.log(this.annotations);
  }

  // Variables de control
  public submitted2: boolean = false;
  public new: boolean = false;
  //---------------------------------------

  // Variables para almacenar los datos provenientes de la consulta
  public treeSelected: Tree;
  public annotations: Annotation[]=[]; // anotaciones que pertenecen al árbol seleccionado

  //---------------------------------------

  public onSubmit() { 
    this.submitted2 = true;
    this.filtro.emit(false);
  }
  public obtenerSelecionado(tree: Tree){
    this.treeSelected = tree;
  }
  public obtenerSelecionadoNueva(tree: Tree){
    this.treeSelected = tree;
    this.new = true;
  }
  public volver(){
    this.submitted2 = false;
    this.new = false;
    this.filtro.emit(true);
  }
}
