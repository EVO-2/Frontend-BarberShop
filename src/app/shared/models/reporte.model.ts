export interface Reporte {
  _id?: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  tipo: 'financiero' | 'operativo' | 'servicios' | 'personalizado';
  generadoPor?: string; // ID del usuario (o puedes crear una interfaz Usuario si lo necesitas expandido)
  datos?: any; // JSON dinámico, puede ser cualquier estructura
  estado?: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}