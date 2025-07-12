import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';   // ruta del backend

  /** Observable para notificar a toda la aplicación la foto de perfil actual */
  private fotoPerfilSubject = new BehaviorSubject<string>(this.obtenerFoto());
  fotoPerfil$ = this.fotoPerfilSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ──────────────────────────  AUTH  ──────────────────────────
  login(data: { correo: string; password: string }) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  guardarToken(token: string, nombre?: string, foto?: string): void {
    localStorage.setItem('token', token);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // 🕒 expiración
      if (payload.exp) {
        const expiraEn = new Date(payload.exp * 1000);
        localStorage.setItem('expiraEn', expiraEn.toISOString());
      }

      // 👤 nombre
      const nombreFinal = nombre || payload.nombre;
      if (nombreFinal) localStorage.setItem('nombreUsuario', nombreFinal);

      // 🖼️ foto
      const fotoFinal = foto || payload.foto;
      if (fotoFinal) {
        const url = fotoFinal.startsWith('http')
          ? fotoFinal
          : `http://localhost:3000/${fotoFinal}`;
        this.actualizarFotoPerfil(url);
      }
    } catch (e) {
      console.error('❌ Error al decodificar el token:', e);
    }
  }

  cerrarSesion(): void {
    localStorage.clear();
  }

  // ──────────────────────────  HELPERS  ──────────────────────────
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    return !!token && !this.isTokenExpirado();
  }

  obtenerRol(): string {
    const info = this.obtenerUsuarioInfo();
    return info ? info.rol : '';
  }

  isTokenExpirado(): boolean {
    const expiraEn = localStorage.getItem('expiraEn');
    return expiraEn ? new Date() >= new Date(expiraEn) : true;
  }

  obtenerUID(): string | null {
    const info = this.obtenerUsuarioInfo();
    return info ? info.uid : null;
  }

  obtenerUsuarioInfo() {
    const token = this.obtenerToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        nombre: localStorage.getItem('nombreUsuario') || payload.nombre,
        foto: this.obtenerFoto(),
        uid: payload.uid,
        rol: payload.rol
      };
    } catch (e) {
      console.error('❌ Error al decodificar el token:', e);
      return null;
    }
  }

  /** Lee la foto guardada en localStorage */
  private obtenerFoto(): string {
    return localStorage.getItem('fotoUsuario') || '';
  }

  /** Actualiza foto en localStorage y emite el cambio a los suscritos */
  actualizarFotoPerfil(url: string): void {
    localStorage.setItem('fotoUsuario', url);
    this.fotoPerfilSubject.next(url);
  }
}
