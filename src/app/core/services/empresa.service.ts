import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AgendamientoEstado {
  agendamientoAbierto: boolean;
  mensajeCierre: string;
}

export interface HorarioDia {
  _id?: string;
  dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  abierto: boolean;
  apertura: string;
  cierre: string;
}

export interface EmpresaInfo {
  _id?: string;
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo?: string;
  horarios?: HorarioDia[];
  agendamientoAbierto?: boolean;
  mensajeCierre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private apiUrl = `${environment.apiUrl}/empresa`;

  constructor(private http: HttpClient) { }

  obtenerEstadoAgendamiento(): Observable<{ success: boolean, agendamientoAbierto: boolean, mensajeCierre: string }> {
    return this.http.get<{ success: boolean, agendamientoAbierto: boolean, mensajeCierre: string }>(`${this.apiUrl}/agendamiento-estado`);
  }

  cambiarEstadoAgendamiento(estado: AgendamientoEstado): Observable<any> {
    return this.http.put(`${this.apiUrl}/agendamiento-estado`, estado);
  }

  obtenerInfoEmpresa(): Observable<{ success: boolean, empresa: EmpresaInfo }> {
    return this.http.get<{ success: boolean, empresa: EmpresaInfo }>(`${this.apiUrl}/info`);
  }

  actualizarInfoEmpresa(datos: EmpresaInfo): Observable<{ success: boolean, msg: string, empresa: EmpresaInfo }> {
    return this.http.put<{ success: boolean, msg: string, empresa: EmpresaInfo }>(`${this.apiUrl}/info`, datos);
  }

}
