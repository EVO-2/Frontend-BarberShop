import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HistorialResponse } from '../interfaces/historial.interface';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = `${environment.apiUrl}/historial`;

  constructor(private http: HttpClient) {}

  obtenerHistorial(limite: number = 50, saltar: number = 0, filtros: any = {}): Observable<HistorialResponse> {
    let params = new HttpParams()
      .set('limite', limite.toString())
      .set('saltar', saltar.toString());

    if (filtros.modulo) params = params.set('modulo', filtros.modulo);
    if (filtros.accion) params = params.set('accion', filtros.accion);
    if (filtros.usuario) params = params.set('usuario', filtros.usuario);
    if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);

    return this.http.get<HistorialResponse>(this.apiUrl, { params });
  }
}
