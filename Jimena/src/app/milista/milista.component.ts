/*                            MilistaComponent
     Elemento hijo de del componente MisAnotacionesComponent.
     Se encarga de la visualización de los árboles de un usuario, así como de redirigir a un usuario a la página
     para añadir una nueva anotación del árbol que se escoja
*/
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
//--------------------------------------------
import {Tree} from '.././tree';
import { Annotation } from '.././Annotation';

@Component({
  selector: 'app-milista',
  templateUrl: './milista.component.html',
  styleUrls: ['./milista.component.css']
})
export class MilistaComponent implements OnInit {

  @Input() trees: Tree[]; // Los árboles a mostrar llegan como parámetro de entrada
  public tree_selected: Tree;
  public annotations: Annotation[]=[];

   //Variables de control -------------------------
   public submitted = false;

  constructor(private router: Router) { }

  

  ngOnInit(): void {
  }

  /**
   * obtenerIdSelecionado: obtengo el árbol que se selecciona
   */
  public obtenerIdSelecionado(tree: Tree) {
    this.tree_selected = tree;
    // Guardo la url del árbol al que quiere añadir una nueva anotación en la sesión
    sessionStorage.setItem('urlTree', this.tree_selected.id);
    
    // El usuario si que está loggeado
    this.router.navigate(['/nuevaAnnot']);
    
  }

  /**
   * onSubmit: oculta la vista de todos los árboles
   */
  public onSubmit() {
    this.submitted = true; 
  }

}
