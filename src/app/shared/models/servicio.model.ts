export interface Servicio {
  _id?: string;               
  nombre: string;             
  precio: number;             
  duracion: number;           
  estado?: boolean;           
  descripcion?: string;       
  imagenes?: string[];        
  createdAt?: string | Date;  
  updatedAt?: string | Date;  
}
