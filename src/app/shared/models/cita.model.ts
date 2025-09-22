import { Cliente } from './cliente.model';
import { Peluquero } from './peluquero.model';
import { Servicio } from './servicio.model';
import { Sede } from './sede.model';
import { PuestoTrabajo } from './puesto-trabajo.model';
import { Pago } from './pago.model';

export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'finalizada';

export interface Cita {
  _id?: string;
  
  cliente: string | Cliente;
  peluquero: string | Peluquero;
  servicios: (string | Servicio)[];
  sede: string | Sede;
  puestoTrabajo: string | PuestoTrabajo;
  pago?: string | Pago | null;

  fecha: string; // siempre manejar ISO string en Angular
  turno: number;

  estado?: EstadoCita;
  observaciones?: string;

  // 🔹 propiedad agregada
  duracionRealMin?: number;

  createdAt?: string;
  updatedAt?: string;
}
