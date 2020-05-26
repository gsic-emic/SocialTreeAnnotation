// Interfaz con los parámetros de un árbol para faciliatr la creación
export interface Tree_complete {
    creator: string;
    lat: number;
    long: number;
    species?: string;
    image?: string;
}
