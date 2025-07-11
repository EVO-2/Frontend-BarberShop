import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // ruta del backend

  constructor(private http: HttpClient) {}

  login(data: { correo: string; password: string }) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cerrarSesion() {
    localStorage.removeItem('token');
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

   obtenerRol(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rol || '';
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return '';
  }
}
}
