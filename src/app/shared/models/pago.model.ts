import { Cita } from './cita.model';

export interface Pago {
  _id?: string;
  cita: string | Cita;
  monto: number;
  metodo: 'efectivo' | 'tarjeta' | 'transferencia';
  estado?: 'pendiente' | 'pagado' | 'fallido';
  observaciones?: string;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}