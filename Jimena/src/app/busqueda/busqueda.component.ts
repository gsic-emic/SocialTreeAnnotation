import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

   /* Array para mostrar la lista de árboles con la directiva ngFor */
   arboles: Array<any> = [
    {especie: "Pino", creador:"Jimena", ubicacion:"Campo Grande, Valladolid, 47007", imagen:"./../assets/images/pino1.png", creacion:"3 horas"}
  ]

}
