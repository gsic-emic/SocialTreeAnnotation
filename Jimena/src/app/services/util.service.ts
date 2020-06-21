import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  //*********** SESIONES *********/
  /**
   * borrarItemSesion
  */
  public borrarItemSesion(item: string) {
    sessionStorage.removeItem(item);
  }

   /*******  Funciones utiles que se usan en varios componentes *********/

   // Método que contruye la fecha actual en formato: DD/MM/AAAA
  public construirFecha(): string{
    var f = new Date();
    var fecha;
    return fecha = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
  }

  // El servidor me devuelve la fecha en formato completo -> convierte a DD/MM/AAAA
  public formatearFecha(date: string): string{
    let nueva_fecha = date.split("T", 2); // Me quedo con el AAAA/MM/DD
    let Arrayfecha = nueva_fecha[0].split("-"); // Genera un array con el dia, mes y año por separado
    let fecha = Arrayfecha[2]+"/"+Arrayfecha[1]+"/"+Arrayfecha[0]; //reordeno para tener DD/MM/AAAA
    return fecha;
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
