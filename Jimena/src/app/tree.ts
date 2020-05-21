// Interfaz con los parámetros de un árbol
export interface Tree {
      id?: string; // el id contiene la url completa para hacer la consulta sobre el arbol
      lat: number;
      long: number;
      species?: string;
      creator: string;
      date?: string;
  }

  