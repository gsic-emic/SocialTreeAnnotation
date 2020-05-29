// Interfaz con los parámetros de un árbol para faciliatr la creación
export interface Tree_complete {
    creator: string;
    lat: number;
    long: number;
    species?: string;
    image?: string;
    title?: string; // titulo de la foto
    description?: string;
    depicts?: string;
    width_img?: number;
    height_img?: number;
    date_img?: Date;
    lat_img?: number;
    long_img?: number;
}
