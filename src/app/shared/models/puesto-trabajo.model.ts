import { Sede } from './sede.model';
import { Peluquero } from './peluquero.model';

export interface PuestoTrabajo {
  _id?: string;
  nombre: string;
  sede: string | Sede;
  peluquero?: string | Peluquero;
  estado?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}