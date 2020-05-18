// Interfaz con los parámetros de un usuario
export interface User {
    id: string;
    nombre: string;
    apellidos:string;
    username: string;
    email: string;
    password?: string; // cómo se guarda esto?????
}

