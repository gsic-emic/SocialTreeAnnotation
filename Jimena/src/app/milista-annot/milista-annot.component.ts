import { Component, OnInit, Input } from '@angular/core';
import { Annotation } from '../Annotation';

@Component({
  selector: 'app-milista-annot',
  templateUrl: './milista-annot.component.html',
  styleUrls: ['./milista-annot.component.css']
})
export class MilistaAnnotComponent implements OnInit {

  @Input() annot: Annotation[]; // Las anotaciones a mostrar llegan como parámetro de entrada

  constructor() { }

  ngOnInit(): void {
  }

}
