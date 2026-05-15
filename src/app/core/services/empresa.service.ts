import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AgendamientoEstado {
  agendamientoAbierto: boolean;
  mensajeCierre: string;
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

}
