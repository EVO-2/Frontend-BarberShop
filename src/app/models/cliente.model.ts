export interface Cliente {
  id?: number;
  nombre: string;
  correo: string;
  telefono: string;
  edad?: number;
  estado?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
