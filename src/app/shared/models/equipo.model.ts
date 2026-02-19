import { Sede } from './sede.model';
import { PuestoTrabajo } from './puesto-trabajo.model';
import { Usuario } from './usuario.model';

export interface Equipo {
  _id?: string;

  nombre: string;
  tipo: string;

  descripcion?: string;
  serial?: string;
  codigoInventario?: string;

  imagenes?: string[];

  sede?: string | Sede | null;
  puesto?: string | PuestoTrabajo | null;
  asignadoA?: string | Usuario | null;

  estado?: 'activo' | 'en_mantenimiento' | 'dañado' | 'fuera_de_servicio' | 'retirado';

  fechaCompra?: Date | string | null;

  proveedor?: string | null;

  costo?: number;
  vidaUtilMeses?: number;

  ultimaRevision?: Date | string | null;
  proximoMantenimiento?: Date | string | null;

  activo?: boolean;

  creadoPor?: string | Usuario | null;
  actualizadoPor?: string | Usuario | null;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
