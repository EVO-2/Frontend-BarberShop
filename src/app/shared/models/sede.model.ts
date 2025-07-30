export interface Sede {
  _id?: string; 
  nombre: string;
  direccion: string;
  telefono?: string;
  estado?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}