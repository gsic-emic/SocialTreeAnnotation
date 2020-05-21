// Interfaz con los parámetros de una anotación
  // Las anotaciones tienen fijo un creador, una fecha de creación y un identificador
  // Las anotaciones pueden ser de diversos tipos
export interface Annotation {
    id: string;
    creator: string;
    date: string;
    primary: boolean; // Controla si es la anotación más votada
    asserted: boolean;
    type: {
      image?: string; //el caracter '?' me indica que estas propiedades son opcionales
      location?: {
        lat: number;
        long: number;
      }
      specie?: string;
    }
  }
