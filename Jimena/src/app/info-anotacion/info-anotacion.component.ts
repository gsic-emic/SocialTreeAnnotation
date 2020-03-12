import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-anotacion',
  templateUrl: './info-anotacion.component.html',
  styleUrls: ['./info-anotacion.component.css']
})
export class InfoAnotacionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  /* Variables utilizadas en el html*/
  mostrar_estadisticas: boolean = false;

}
