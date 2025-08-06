import { Usuario } from './usuario.model';  

export interface Peluquero {
  _id?: string; 
  usuario: string | Usuario;  
  especialidades?: string[];
  experiencia?: number;
  telefono_profesional?: string;
  direccion_profesional?: string; 
  genero?: 'masculino' | 'femenino' | 'otro';
  fecha_nacimiento?: string;  
  sede?: string | null; 
  puestoTrabajo?: string | null;  
  estado?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
