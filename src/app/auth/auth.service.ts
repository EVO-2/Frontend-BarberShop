import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly backendBase = 'http://localhost:3000';
  private readonly apiUrl = `${this.backendBase}/api/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ================== Autenticación ==================
  login(credentials: { correo: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  // ================== Registro ==================
  registro(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, data);
  }

  // ================== Validación Asincrónica ==================
  verificarCorreo(correo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar-correo/${correo}`);
  }

  // ================== Local Storage ==================
  guardarDatos(token: string, usuario: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  getNombre(): string {
    const usuario = this.getUsuario();
    return usuario?.nombre || 'Usuario';
  }

  getRol(): string {
    const usuario = this.getUsuario();
    return usuario?.rol || '';
  }

  getAvatar(): string | null {
    const usuario = this.getUsuario();
    return usuario?.foto || null;
  }

  actualizarAvatar(fotoUrl: string): void {
    const usuario = this.getUsuario();
    if (usuario) {
      usuario.foto = fotoUrl;
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }
  }
}
