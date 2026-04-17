import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 🔹 Interfaces (tipado PRO)
export interface Producto {
    _id: string;
    nombre: string;
    categoria: any;
    proveedor: any;
    sede: any;
    tipo: 'venta' | 'uso_interno';
    cantidad: number;
    precio: number;
    usado: boolean;
    estado: boolean;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductosService {

    private apiUrl = `${environment.apiUrl}/productos`;

    constructor(private http: HttpClient) {
        //console.log('🧪 ENVIRONMENT:', environment);
        //console.log('📦 PRODUCTOS API:', this.apiUrl);
    }

    // =========================
    // 📥 Obtener productos (con filtros)
    // =========================
    obtenerProductos(filtros?: any): Observable<{ ok: boolean; productos: Producto[] }> {
        let params = new HttpParams();

        if (filtros) {
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== null && filtros[key] !== '') {
                    params = params.set(key, filtros[key]);
                }
            });
        }

        console.log('📡 GET ->', this.apiUrl, 'params:', filtros);

        return this.http.get<{ ok: boolean; productos: Producto[] }>(this.apiUrl, { params });
    }

    // =========================
    // 📥 Obtener producto por ID
    // =========================
    obtenerProducto(id: string): Observable<{ ok: boolean; producto: Producto }> {
        console.log('📡 GET ->', `${this.apiUrl}/${id}`);
        return this.http.get<{ ok: boolean; producto: Producto }>(`${this.apiUrl}/${id}`);
    }

    // =========================
    // ➕ Crear producto
    // =========================
    crearProducto(data: Partial<Producto>): Observable<any> {
        console.log('📡 POST ->', this.apiUrl, data);
        return this.http.post(this.apiUrl, data);
    }

    // =========================
    // ✏️ Actualizar producto
    // =========================
    actualizarProducto(id: string, data: Partial<Producto>): Observable<any> {
        console.log('📡 PUT ->', `${this.apiUrl}/${id}`, data);
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    // =========================
    // ❌ Eliminar (soft delete)
    // =========================
    eliminarProducto(id: string): Observable<any> {
        console.log('📡 DELETE ->', `${this.apiUrl}/${id}`);
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // =========================
    // 🔄 Activar / Desactivar (extra PRO)
    // =========================
    cambiarEstado(id: string, estado: boolean): Observable<any> {
        console.log('📡 PATCH ->', `${this.apiUrl}/${id}/estado`, { estado });
        return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado });
    }
}