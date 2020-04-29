import { Component, OnInit, Input } from '@angular/core';
import { Tree } from '../tree';
import { Annotation } from '../Annotation';

@Component({
  selector: 'app-validar',
  templateUrl: './validar.component.html',
  styleUrls: ['./validar.component.css']
})
export class ValidarComponent implements OnInit {

  @Input() tree: Tree; /* Información que le llega del padre acerca del árbol a validar*/
  @Input() annotations: Annotation[];

   //variables de control
   submitted = false;

   // Variables que se recogen del formulario
   public lat: number;
   public long: number;
   public specie: string;
   public hoja: string;
   public fruto: string;

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit() { 
    this.submitted = true;
  }

  reset(){
    this.lat = null;
    this.long = null;
    this.specie = null;
    this.hoja = null;
    this.fruto = null;
  }

}
