// Interfaz con los parámetros de una anotación
  // Las anotaciones tienen fijo un creador, una fecha de creación y un identificador
  // Las anotaciones pueden ser de diversos tipos
export interface Annotation {
    id: string;
    creator: string;
    date: string;
    type: {
      image?: string; //el caracter '?' me indica que estas propiedades son opcionales
      location?: {
        lat: number;
        long: number;
      }
      specie?: string;
      hoja?: string;
      fruto?: string;
    }
  }
