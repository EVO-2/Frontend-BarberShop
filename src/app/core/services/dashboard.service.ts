import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ================================
   📊 INGRESOS POR DÍA
================================ */
export interface IngresoPorDia {
    _id: number; // $dayOfWeek (1-7)
    total: number;
}

/* ================================
   📈 ESTADOS DE CITAS
================================ */
export interface CitasPorEstado {
    _id: string; // pendiente | finalizada | cancelada
    total: number;
}

/* ================================
   🏆 SERVICIOS TOP
================================ */
export interface ServicioTop {
    nombre: string;
    total: number;
}

/* ================================
   📊 COMPARACIÓN SEMANA
================================ */
export interface ComparacionSemana {
    actual: number;
    anterior: number;
    variacion: number;
}

/* ================================
   📋 DASHBOARD RESUMEN
================================ */
export interface DashboardResumen {
    totalClientes: number;
    citasHoy: number;
    ingresosHoy: number;
    peluquerosActivos: number;
    ultimasCitas: any[];

    // 🔥 Datos dinámicos reales desde backend
    ingresosSemana: IngresoPorDia[];
    comparacionSemana: ComparacionSemana;
    estadosCitas: CitasPorEstado[];
    serviciosTop: ServicioTop[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    // 🔹 Cambiado a la IP de tu PC, no localhost
    private apiUrl = 'http://192.168.1.7:3000/api/dashboard';

    constructor(private http: HttpClient) { }

    // 🔹 Método para obtener resumen del dashboard
    obtenerResumen(): Observable<DashboardResumen> {
        return this.http.get<DashboardResumen>(`${this.apiUrl}/resumen`);
    }
}