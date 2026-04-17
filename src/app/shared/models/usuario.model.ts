import { Rol } from './rol.model';
import { Cliente } from './cliente.model';
import { Peluquero } from './peluquero.model';
import { Manicurista } from './manicurista.model';

export interface Usuario {
  _id?: string;
  nombre: string;
  correo: string;
  password?: string;
  rol: Rol | string;
  foto?: string;
  estado?: boolean;

  permisos?: string[];
  cliente?: Cliente | string | null;
  peluquero?: Peluquero | string | null;
  manicurista?: Manicurista | string | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}