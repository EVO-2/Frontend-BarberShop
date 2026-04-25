import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * ===================================================
   * 🔧 Función privada para normalizar arrays del backend
   * ===================================================
   */
  private normalizarArray(res: any): any[] {

    if (!res) return [];

    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.resultado)) return res.resultado;
    if (Array.isArray(res.detalle)) return res.detalle;
    if (Array.isArray(res.reporte)) return res.reporte;

    return [];
  }

  /**
   * ===================================================
   * 🧾 Reporte de ingresos
   * ===================================================
   */
  obtenerIngresos(
    fechaInicio: string,
    fechaFin: string,
    sede?: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    // 🔵 Si se selecciona sede se envía al backend
    if (sede) {
      params = params.set('sede', sede);
    }

    return this.http
      .get<any>(`${this.apiUrl}/reportes/ingresos`, { params })
      .pipe(
        map((res: any) => {

          return {
            ok: res?.ok ?? false,

            rango: res?.rango ?? {},

            resumen: res?.resumen ?? {
              cantidadCitas: 0,
              totalServicios: 0,
              ingresosTotales: 0,
              promedioPorCita: 0
            },

            // 🔵 Ingresos agrupados por sede
            ingresosPorSede: res?.ingresosPorSede ?? {},

            // 🔹 Detalle de citas (tabla del reporte)
            detalle: this.normalizarArray(res?.detalle)
          };

        })
      );
  }

  /**
   * ===================================================
   * 💈 Reporte de citas por barbero
   * ===================================================
   */
  obtenerCitasPorBarbero(
    fechaInicio: string,
    fechaFin: string,
    sede?: string
  ): Observable<any[]> {

    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    if (sede) {
      params = params.set('sede', sede);
    }

    return this.http
      .get<any>(`${this.apiUrl}/reportes/barberos`, { params })
      .pipe(
        map((res: any) => this.normalizarArray(res))
      );
  }

  /**
   * ===================================================
   * 👥 Reporte de clientes frecuentes
   * ===================================================
   */
  obtenerClientesFrecuentes(
    fechaInicio: string,
    fechaFin: string,
    sede?: string
  ): Observable<any[]> {

    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    if (sede) {
      params = params.set('sede', sede);
    }

    return this.http
      .get<any>(`${this.apiUrl}/reportes/clientes`, { params })
      .pipe(
        map((res: any) => this.normalizarArray(res))
      );
  }

  /**
   * ===================================================
   * 📦 Reporte de inventario
   * ===================================================
   */
  obtenerReporteInventario(): Observable<any[]> {

    return this.http
      .get<any>(`${this.apiUrl}/reportes/inventario`)
      .pipe(
        map((res: any) => this.normalizarArray(res))
      );
  }

  /**
   * ===================================================
   * 🛒 Reporte de Productos
   * ===================================================
   */
  obtenerReporteProductos(): Observable<any[]> {

    return this.http
      .get<any>(`${this.apiUrl}/reportes/productos`)
      .pipe(
        map((res: any) => this.normalizarArray(res))
      );
  }

}
