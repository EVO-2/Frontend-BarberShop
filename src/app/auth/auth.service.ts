import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // ruta del backend

  constructor(private http: HttpClient) {}

  login(data: { correo: string; password: string }) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  guardarToken(token: string, nombre?: string, foto?: string): void {
  localStorage.setItem('token', token);

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // 🕒 Guardar expiración si existe
    if (payload.exp) {
      const expiraEn = new Date(payload.exp * 1000);
      localStorage.setItem('expiraEn', expiraEn.toISOString());
    }

    // 👤 Guardar nombre y foto (prioridad: argumento → payload)
    const nombreFinal = nombre || payload.nombre;
    if (nombreFinal) {
      localStorage.setItem('nombreUsuario', nombreFinal);
    }

    const fotoFinal = foto || payload.foto; // asume que el backend puede incluir foto
    if (fotoFinal) {
      localStorage.setItem('fotoUsuario', fotoFinal);
    }

  } catch (e) {
    console.error('❌ Error al decodificar el token al guardar:', e);
  }
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiraEn');
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    return !!token && !this.isTokenExpirado();
  }

  obtenerRol(): string {
    const token = this.obtenerToken();
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol || '';
    } catch (error) {
      console.error('❌ Error al decodificar el token:', error);
      return '';
    }
  }

  isTokenExpirado(): boolean {
    const expiraEnStr = localStorage.getItem('expiraEn');
    if (!expiraEnStr) return true;

    const expiraEn = new Date(expiraEnStr);
    return new Date() >= expiraEn;
  }

 obtenerUsuarioInfo() {
  const token = this.obtenerToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      nombre: payload.nombre,
      foto: payload.foto,
      uid: payload.uid,
      rol: payload.rol
    };
  } catch (e) {
    console.error('❌ Error al decodificar el token:', e);
    return null;
  }
}
 

}
