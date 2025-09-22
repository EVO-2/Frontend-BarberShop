export interface Servicio {
  _id?: string;
  nombre: string;
  precio: number;
  duracion: number; // duración prevista en minutos
  estado?: boolean;

  // 🔹 Nuevos campos para duración real
  inicioServicio?: string | Date;    // hora de inicio del servicio
  finServicio?: string | Date;       // hora de finalización del servicio
  duracionRealMin?: number;          // duración real en minutos

  createdAt?: string | Date;
  updatedAt?: string | Date;
}
