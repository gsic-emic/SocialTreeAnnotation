import { Component, OnInit, Input } from '@angular/core';
import { Arbol } from '../arbol';

@Component({
  selector: 'app-validar',
  templateUrl: './validar.component.html',
  styleUrls: ['./validar.component.css']
})
export class ValidarComponent implements OnInit {

  @Input() arbol: Arbol; /* Información que le llega del padre acerca del árbol a anotar*/

  constructor() { }

  ngOnInit(): void {
  }

}
