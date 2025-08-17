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


