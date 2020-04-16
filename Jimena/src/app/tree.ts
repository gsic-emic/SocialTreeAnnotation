// Interfaz con los parámetros de un árbol
export interface Tree {
    id: string;
    creator: string;
    date: string;
    imageAnnotation: string; //a partir de aquí son datos que se cargan según las diferentes anotaciones
    latAnnotation: number;
    longAnnotation: number;
    specieAnnotation: string;
  }