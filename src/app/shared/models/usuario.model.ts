import { Rol } from './rol.model';
import { Cliente } from './cliente.model';
import { Peluquero } from './peluquero.model';

export interface Usuario {
  _id?: string;
  nombre: string;
  correo: string;
  password?: string; // opcional en frontend por seguridad
  rol: Rol | string; // puede venir como objeto o solo el ID
  foto?: string;
  estado?: boolean;

  cliente?: Cliente | string | null;
  peluquero?: Peluquero | string | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}