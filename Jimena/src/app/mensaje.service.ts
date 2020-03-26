import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MensajeService {
  mensajes: string[] = [];

  add(mensaje: string) {
    this.mensajes.push(mensaje);
  }

  clear() {
    this.mensajes = [];
  }
}


/* Al final de esta página está detallado cómo añadir más mensajes que me pueden
  servir de ayuda:
                  https://angular.io/tutorial/toh-pt4*/