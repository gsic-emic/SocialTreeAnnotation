import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }
   /*******  Funciones utiles que se usan en varios componentes *********/

  public construirFecha(): string{
    var f = new Date();
    var fecha;
    return fecha = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
  }

  /*********************** CONTROL DE ERRORES ********************************************/
  public crearMensajeError(errorCode: number){
    let mensajeError;

    switch (errorCode){
      case 0: return mensajeError = " Parece que tenemos problemas con el servidor ";
      case 400: return mensajeError = " Error 400. Bad Request ";
      case 401: return mensajeError = " Error 401. No autorizado ";
      case 404: return mensajeError = " Error 404. Not found ";
      case 413: return mensajeError = " La imagen seleccionada ocupa demasiado espacio. Por favor, comprima el archivo antes de subirlo "

    }

  }

}
