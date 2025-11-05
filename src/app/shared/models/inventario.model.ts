export interface Inventario {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipo: 'producto' | 'herramienta' | 'insumo';
  cantidad: number;
  sede: string; // ID de la sede, o puede ser un objeto con más datos si se necesita
  estado?: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}