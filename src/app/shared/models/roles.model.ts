export interface Rol {
    _id?: string;
    nombre: string;
    descripcion?: string;
    permisos: any[];
    estado?: boolean;
}