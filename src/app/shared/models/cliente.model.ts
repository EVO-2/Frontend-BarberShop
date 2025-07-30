export interface Cliente {
  _id?: string; // Opcional si se está creando
  usuario: string; // ID del usuario relacionado
  telefono?: string;
  direccion?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  fecha_nacimiento?: Date | string;
  fechaAlta?: Date | string;
  estado?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}