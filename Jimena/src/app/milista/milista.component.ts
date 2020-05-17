import { Component, OnInit, Input } from '@angular/core';
import {Tree} from '.././tree';
import { Annotation } from '.././Annotation';

@Component({
  selector: 'app-milista',
  templateUrl: './milista.component.html',
  styleUrls: ['./milista.component.css']
})
export class MilistaComponent implements OnInit {

  constructor() { }

  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada
  public tree_selected: Tree;
  public annotations: Annotation[]=[];

   //Variables de control -------------------------
   public submitted = false;

  ngOnInit(): void {
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
