export interface Rol {
  _id?: string;
  nombre: 'admin' | 'cliente' | 'barbero' | 'recepcionista' | 'gerente';
  descripcion?: string;
  estado?: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}