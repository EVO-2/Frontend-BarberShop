export interface HistorialAcceso {
  _id?: string;
  usuario: string; // ID del usuario
  fecha?: string | Date; // Fecha del intento de acceso
  ip?: string;
  dispositivo?: string;
  exito?: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}