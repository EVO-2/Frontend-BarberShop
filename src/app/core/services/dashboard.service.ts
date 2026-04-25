import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DashboardResumen {
    totalClientes: number;
    citasHoy: number;
    ingresosHoy: number;
    peluquerosActivos: number;

    ultimasCitas: any[];

    ingresosSemana: {
        _id: number;
        total: number;
    }[];

    comparacionSemana: {
        actual: number;
        anterior: number;
        variacion: number;
    };

    estadosCitas: {
        _id: string;
        total: number;
    }[];

    serviciosTop: {
        nombre: string;
        total: number;
    }[];

    peluqueroTop: {
        nombre: string;
        totalServicios: number;
    } | null;

    // 🔥 NUEVO KPI: CLIENTE TOP
    clienteTop: {
        nombre: string;
        totalServicios: number;
    } | null;

    // 🔥 NUEVO KPI: PRODUCTOS TOP
    productosTop: {
        nombre: string;
        total: number;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    // 🔹 Endpoint backend
    private apiUrl = `${environment.apiUrl}/dashboard/resumen`;

    constructor(private http: HttpClient) { }

    obtenerResumen(sedeId: string): Observable<DashboardResumen> {

        const params = new HttpParams()
            .set('sede', sedeId);

        return this.http.get<DashboardResumen>(this.apiUrl, { params });

    }

}