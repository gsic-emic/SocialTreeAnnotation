import { Component, OnInit, Input } from '@angular/core';
import {Tree} from '.././tree';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada

  constructor() { }

  ngOnInit(): void {
  }
  public submitted = false;
  public tree_selected: Tree;



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
