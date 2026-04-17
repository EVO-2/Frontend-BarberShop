import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class RolesService {

    private apiUrl = `${environment.apiUrl}/roles`;

    constructor(private http: HttpClient) { }

    getRoles(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    crearRol(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    actualizarRol(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    eliminarRol(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}