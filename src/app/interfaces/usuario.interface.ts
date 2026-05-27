
export interface Usuario {
  id?: number | string;
  _id?: string;
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
