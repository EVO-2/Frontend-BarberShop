import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Rol } from '../../shared/models/roles.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RolesService {

    private baseUrl = 'http://localhost:3000/api/roles';

    constructor(private http: HttpClient) { }

    getRoles(): Observable<Rol[]> {
        return this.http.get<Rol[]>(this.baseUrl);
    }

    crearRol(data: Rol): Observable<Rol> {
        return this.http.post<Rol>(this.baseUrl, data);
    }

    actualizarRol(id: string, data: Rol): Observable<Rol> {
        return this.http.put<Rol>(`${this.baseUrl}/${id}`, data);
    }

    eliminarRol(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }
}