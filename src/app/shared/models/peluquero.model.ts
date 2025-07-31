export interface Peluquero {
  _id?: string; // Opcional al crear
  usuario: string; // ID del usuario relacionado
  especialidades?: string[];
  experiencia?: number;
  telefono_profesional?: string;
  direccion_profesional?: string; 
  genero?: 'masculino' | 'femenino' | 'otro';
  fecha_nacimiento?: Date | string;
  sede?: string | null; // ID de la sede
  puestoTrabajo?: string | null; // ID del puesto
  estado?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
