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
    imagen?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductosService {

    private apiUrl = `${environment.apiUrl}/productos`;

    constructor(private http: HttpClient) { }

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

        return this.http.get<{ ok: boolean; productos: Producto[] }>(
            this.apiUrl,
            { params }
        );
    }

    // =========================
    // 📥 Obtener producto por ID
    // =========================
    obtenerProducto(id: string): Observable<{ ok: boolean; producto: Producto }> {
        return this.http.get<{ ok: boolean; producto: Producto }>(
            `${this.apiUrl}/${id}`
        );
    }

    // =========================
    // ➕ Crear producto
    // =========================
    crearProducto(data: Partial<Producto>): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    // =========================
    // ✏️ Actualizar producto
    // =========================
    actualizarProducto(id: string, data: Partial<Producto>): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    // =========================
    // ❌ Eliminar (soft delete)
    // =========================
    eliminarProducto(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // =========================
    // 🔄 Activar / Desactivar
    // =========================
    cambiarEstado(id: string, estado: boolean): Observable<any> {
        return this.http.patch(
            `${this.apiUrl}/${id}/estado`,
            { estado }
        );
    }

    // =========================
    // 🔴 Desactivar producto
    // =========================
    desactivarProducto(id: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/desactivar/${id}`, {});
    }

    // =========================
    // 🟢 Activar producto
    // =========================
    activarProducto(id: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/activar/${id}`, {});
    }

    // =========================
    // 📷 Subir Imagen
    // =========================
    subirImagen(id: string, archivo: File): Observable<any> {
        const formData = new FormData();
        formData.append('imagen', archivo);

        return this.http.post(`${this.apiUrl}/${id}/imagen`, formData);
    }
}