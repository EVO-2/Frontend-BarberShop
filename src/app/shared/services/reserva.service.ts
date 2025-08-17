import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CrearCitaPayload {
  cliente: string;         
  sede: string;            
  peluquero: string;       
  puestoTrabajo: string;   
  servicios: string[];     
  fecha: string;           
  fechaBase: string;       
  hora: string;            
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes`);
  }

  getPeluqueros(): Observable<any> {
    return this.http.get(`${this.apiUrl}/peluqueros`);
  }

  getServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicios`);
  }

  getSedes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sedes`);
  }

  getPuestosPorSede(sedeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/puestos/por-sede/${sedeId}`);
  }

  /**
   * Crear una cita con todos los datos que requiere el backend
   */
  crearCita(data: CrearCitaPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas`, data);
  }

  /**
   * Obtiene las citas de una sede en una fecha específica
   * @param sedeId 
   * @param fecha 
   */
  getCitasPorFechaYHora(sedeId: string, fecha: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/citas/por-sede-fecha?sedeId=${sedeId}&fecha=${fecha}`);
  }
}
