import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  /* Variables utilizadas en el html */
  mapa: boolean = true;

  /* Array para mostrar la lista de árboles con la directiva ngFor */
  arboles: Array<any> = [
    {especie: "Pino", creador: "Jimena Andrade", dirección: "Campo Grande, Valladolid, 47007", imagen: "pino1.png"}
  ]

}
