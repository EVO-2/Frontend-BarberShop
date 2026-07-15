import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Categoria {
  _id?: string;
  nombre: string;
  descripcion?: string;
  estado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private baseUrl: string = environment.apiUrl + '/categorias';

  constructor(private http: HttpClient) { }

  obtenerCategorias(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  obtenerCategoria(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  crearCategoria(data: Categoria): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  actualizarCategoria(id: string, data: Categoria): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  eliminarCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
