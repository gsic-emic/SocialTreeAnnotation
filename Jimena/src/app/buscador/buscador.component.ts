import { Component, OnInit } from '@angular/core';
import {APIService} from '../api.service';
import {Tree} from '../tree';


@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent implements OnInit {

  constructor(private api: APIService) { }

  ngOnInit(): void {
  }

}
