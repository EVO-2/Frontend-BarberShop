import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root',
})
export class SedeService {
  private apiUrl = 'http://localhost:3000/api/sedes';

  constructor(private http: HttpClient) {}

  obtenerSedes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}