import { Usuario } from './usuario.model';  

export interface Peluquero {
  _id?: string; 
  usuario: Usuario;  
  especialidades?: string[];
  experiencia?: number;
  telefono_profesional?: string;
  direccion_profesional?: string; 
  genero?: 'masculino' | 'femenino' | 'otro';
  fecha_nacimiento?: Date | string;  
  sede?: string | null; 
  puestoTrabajo?: string | null;  
  estado?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
