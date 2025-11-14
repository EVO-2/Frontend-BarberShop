import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * ===================================================
   * 🔧 Función privada para normalizar arrays del backend
   * ===================================================
   * Acepta:
   *   - array directo
   *   - { data: [] }
   *   - { resultado: [] }
   *   - { detalle: [] }
   *   - objeto vacío
   *   - null / undefined
   */
  private normalizarArray(res: any): any[] {
    if (!res) return [];

    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.resultado)) return res.resultado;
    if (Array.isArray(res.detalle)) return res.detalle;

    return [];
  }

  /**
   * 🧾 Reporte de ingresos entre dos fechas
   */
  obtenerIngresos(fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<any>(`${this.apiUrl}/reportes/ingresos`, { params });
  }

  /**
   * 💈 Reporte de citas por barbero
   */
  obtenerCitasPorBarbero(fechaInicio: string, fechaFin: string): Observable<any[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http
      .get<any>(`${this.apiUrl}/reportes/barberos`, { params })
      .pipe(map(res => this.normalizarArray(res)));
  }

  /**
   * 👥 Reporte de clientes frecuentes
   */
  obtenerClientesFrecuentes(fechaInicio: string, fechaFin: string): Observable<any[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http
      .get<any>(`${this.apiUrl}/reportes/clientes`, { params })
      .pipe(map(res => this.normalizarArray(res)));
  }

  /**
   * 📦 Reporte de inventario
   */
  obtenerReporteInventario(): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/reportes/inventario`)
      .pipe(map(res => this.normalizarArray(res)));
  }
}
