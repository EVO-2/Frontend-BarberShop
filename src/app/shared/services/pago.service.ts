import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private baseUrl = 'http://localhost:PORT/api/pagos'; 

  constructor(private http: HttpClient) { }

  crearPago(pago: any): Observable<any> {
    return this.http.post(this.baseUrl, pago);
  }

  obtenerPagos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  obtenerPagoPorId(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  actualizarPago(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }
}
