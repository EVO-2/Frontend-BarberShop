import { Equipo } from './equipo.model';
import { Sede } from './sede.model';
import { PuestoTrabajo } from './puesto-trabajo.model';
import { Usuario } from './usuario.model';

export interface EquipoMovimiento {
  _id?: string;

  equipo: string | Equipo;

  tipo:
    | 'alta'
    | 'traspaso'
    | 'prestamo'
    | 'devolucion'
    | 'mantenimiento'
    | 'reparacion'
    | 'baja'
    | 'ajuste';

  fromSede?: string | Sede | null;
  toSede?: string | Sede | null;

  fromPuesto?: string | PuestoTrabajo | null;
  toPuesto?: string | PuestoTrabajo | null;

  responsable?: string | Usuario | null;

  descripcion?: string;

  fechaInicio?: Date | string;
  fechaFin?: Date | string | null;

  costo?: number;

  referenciaId?: string | null;

  creadoPor?: string | Usuario | null;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
