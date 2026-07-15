import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface VentaDTO {
  productos: {
    producto: string; // ID del producto
    cantidad: number;
  }[];
  metodoPago: string;
  observaciones?: string;
  cliente?: string; // ID del cliente si lo hay
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  registrarVenta(data: VentaDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/ventas`, data);
  }

  obtenerHistorialVentas(sedeId?: string): Observable<any> {
    const url = sedeId ? `${this.baseUrl}/ventas?sede=${sedeId}` : `${this.baseUrl}/ventas`;
    return this.http.get(url);
  }
}
