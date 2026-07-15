import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Proveedor {
  _id?: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  private baseUrl: string = environment.apiUrl + '/proveedores';

  constructor(private http: HttpClient) { }

  obtenerProveedores(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  obtenerProveedor(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  crearProveedor(data: Proveedor): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  actualizarProveedor(id: string, data: Proveedor): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  eliminarProveedor(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
