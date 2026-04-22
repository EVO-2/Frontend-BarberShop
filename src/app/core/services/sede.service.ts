import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Sede {
  _id?: string;
  nombre: string;
  direccion: string;
  telefono: string;
  estado: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class SedeService {

  private apiUrl = `${environment.apiUrl}/sedes`;

  constructor(private http: HttpClient) { }

  /**
   * 🔹 Obtener todas las sedes
   */
  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.apiUrl).pipe(
      map((sedes: any[]) =>
        sedes.map(sede => ({
          ...sede,
          estado: sede.estado ?? true
        }))
      )
    );
  }

  /**
   * 🔹 Crear una nueva sede
   */
  crearSede(sede: Sede): Observable<Sede> {
    return this.http.post<Sede>(this.apiUrl, {
      ...sede,
      estado: true
    });
  }

  /**
   * 🔹 Actualizar una sede existente
   */
  actualizarSede(id: string, sede: Sede): Observable<Sede> {
    return this.http.put<Sede>(`${this.apiUrl}/${id}`, sede);
  }

  /**
   * 🔹 Cambiar estado (SOFT DELETE)
   */
  actualizarEstado(id: string, nuevoEstado: boolean): Observable<Sede> {
    return this.http.patch<Sede>(
      `${this.apiUrl}/${id}/estado`,
      { estado: nuevoEstado }
    );
  }

  /**
   * 🔹 Obtener puestos disponibles en una sede
   */
  obtenerPuestosDisponibles(sedeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${sedeId}/puestos`);
  }
}