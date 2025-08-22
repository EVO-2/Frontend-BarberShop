
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'cliente' | 'peluquero' | 'admin';
  foto?: string;
  cliente?: {
    direccion?: string;
    telefono?: string;
  };
  peluquero?: {
    especialidades?: string;
    telefono?: string;
  };
}
