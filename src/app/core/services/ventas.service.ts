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
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  registrarVenta(data: VentaDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventas`, data);
  }

  obtenerHistorialVentas(sedeId?: string): Observable<any> {
    const url = sedeId ? `${this.apiUrl}/ventas?sede=${sedeId}` : `${this.apiUrl}/ventas`;
    return this.http.get(url);
  }
}
