import { Usuario } from './usuario.model';

export interface Cliente {
  _id?: string;
  usuario: Usuario; 
  telefono?: string;
  direccion?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  fecha_nacimiento?: Date | string;
  fechaAlta?: Date | string;
  estado?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
