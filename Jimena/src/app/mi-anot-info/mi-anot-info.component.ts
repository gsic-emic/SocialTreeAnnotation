import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mi-anot-info',
  templateUrl: './mi-anot-info.component.html',
  styleUrls: ['./mi-anot-info.component.css']
})
export class MiAnotInfoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

   /* Variables utilizadas en el html*/
   mostrar_estadisticas: boolean = false;

}
