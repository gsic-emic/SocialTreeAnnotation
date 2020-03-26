import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nueva-anotacion',
  templateUrl: './nueva-anotacion.component.html',
  styleUrls: ['./nueva-anotacion.component.css']
})
export class NuevaAnotacionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getLocation() {
    var mostrar = "Se ha pulsado el botón";
    var x = document.getElementById("localizacion");
    x.innerHTML = mostrar;
    /*if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition);
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }*/
  }

  showPosition(position) {
    var cadena = "Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude;
    console.log(cadena);
    /*var x = document.getElementById("localizacion");
    x.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;*/
  }
}
