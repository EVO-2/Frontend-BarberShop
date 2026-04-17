import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PermisosService {

    private apiUrl = `${environment.apiUrl}/permisos`;

    constructor(private http: HttpClient) { }

    getPermisos(): Observable<any> {
        return this.http.get(this.apiUrl);
    }
}