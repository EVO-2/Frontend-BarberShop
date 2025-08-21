import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root',
})
export class SedeService {
  private apiUrl = `${environment.apiUrl}/sedes`;

  constructor(private http: HttpClient) {}

  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.apiUrl);
  }
}
