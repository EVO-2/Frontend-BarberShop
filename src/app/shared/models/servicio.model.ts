export interface Servicio {
  _id?: string;
  nombre: string;
  precio: number;
  duracion: number; // en minutos
  estado?: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}