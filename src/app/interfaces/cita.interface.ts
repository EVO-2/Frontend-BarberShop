// 📌 Payload para crear una cita
export interface CrearCitaPayload {
  cliente: string;
  sede: string;
  peluquero: string;
  puestoTrabajo?: string | null;
  servicios: string[];
  fecha: string;      
  fechaBase: string;  
  hora: string;       
}

// 📌 Representa una cita que viene del backend
export interface Cita {
  id: string;

  cliente: {
    id: string;
    nombre: string;
  };

  sede: {
    id: string;
    nombre: string;
  };

  peluquero: {
    id: string;
    nombre: string;
  };

  puestoTrabajo?: {
    id: string;
    nombre: string;
  } | null;

  servicios: {
    id: string;
    nombre: string;
    precio: number;
  }[];

  fecha: string;   
  hora: string;    
  estado: string;  // pendiente | confirmada | en_proceso | finalizada | cancelada
  notas?: string;
  razon?: string;

}

// 📌 Representa la respuesta del backend al devolver un listado de citas
export interface RespuestaCitas {
  total: number;
  page: number;         
  totalPages: number;   
  citas: Cita[];
}
