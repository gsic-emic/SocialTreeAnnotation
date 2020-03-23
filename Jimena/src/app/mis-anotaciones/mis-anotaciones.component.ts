import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mis-anotaciones',
  templateUrl: './mis-anotaciones.component.html',
  styleUrls: ['./mis-anotaciones.component.css']
})
export class MisAnotacionesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

   /* Array para mostrar la lista de árboles con la directiva ngFor */
   arboles: Array<any> = [
    {especie: "Pino", creador:"Jimena", ubicacion:"Campo Grande, Valladolid, 47007", imagen:"./../assets/images/pino1.png", creacion:"3 horas"},
    {especie: "Abeto", creador:"Jimena", ubicacion:"Campo Grande, Valladolid, 47007", imagen:"./../assets/images/abeto1.png", creacion:"5 horas"},
    {especie: "Pino", creador:"Jimena", ubicacion:"Campo Grande, Valladolid, 47007", imagen:"./../assets/images/pino1.png", creacion:"3 horas"},

  ]

}
