import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private rolUsuario = '';

  private usuarioSubject = new BehaviorSubject<any>(this.getUsuario());
  usuario$ = this.usuarioSubject.asObservable();

  private avatarUrlSubject = new BehaviorSubject<string>(this.getFotoUrl(this.getUsuario()));
  avatarUrl$ = this.avatarUrlSubject.asObservable();

  private fotoPerfilSubject = new BehaviorSubject<string>(this.getFotoUrl(this.getUsuario()));
  fotoPerfilUrl$ = this.fotoPerfilSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // =================== Autenticación ===================
  login(datos: { correo: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, datos);
  }

  registro(nuevoUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, nuevoUsuario);
  }

  verificarCorreo(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-correo`, { correo: email });
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.usuarioSubject.next(null);
    this.avatarUrlSubject.next('assets/img/default-avatar.png');
    this.fotoPerfilSubject.next('assets/img/default-avatar.png');
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.cerrarSesion();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // =================== Usuario ===================
  guardarDatos(token: string, usuario: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.rolUsuario = usuario.rol;

    const fotoUrl = this.getFotoUrl(usuario);
    this.usuarioSubject.next(usuario);
    this.avatarUrlSubject.next(fotoUrl);
    this.fotoPerfilSubject.next(fotoUrl);
  }

  getUsuario(): any {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  obtenerRol(): string {
    if (this.rolUsuario) return this.rolUsuario;
    const usuario = this.getUsuario();
    return usuario?.rol || '';
  }

  obtenerNombre(): string {
    return this.getUsuario()?.nombre || '';
  }

  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  actualizarPerfil(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, formData);
  }

  refrescarUsuario(): void {
    this.http.get<any>(`${this.apiUrl}/perfil`).subscribe({
      next: (usuario) => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.usuarioSubject.next(usuario);

        const nuevaUrl = this.getFotoUrl(usuario);
        this.avatarUrlSubject.next(nuevaUrl);
        this.fotoPerfilSubject.next(nuevaUrl);
      },
      error: (error) => {
        console.error('Error al refrescar usuario:', error);
      }
    });
  }

  // =================== Foto de Perfil ===================

  /** Retorna la URL completa de la foto del usuario, con fallback al avatar por defecto */
  getFotoUrl(usuario: any): string {
    return usuario?.foto
      ? `${this.apiUrl}/uploads/${usuario.foto}?t=${Date.now()}`
      : 'assets/img/default-avatar.png';
  }

  /** Retorna el usuario actual desde localStorage */
  getUsuarioActual(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  /** Actualiza la foto del usuario en localStorage y notifica a los Subjects */
  actualizarFoto(nombreArchivo: string | null): void {
    const usuario = this.getUsuarioActual();
    if (usuario) {
      usuario.foto = nombreArchivo;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      this.usuarioSubject.next(usuario);

      const url = nombreArchivo
        ? `${this.apiUrl}/uploads/${nombreArchivo}?t=${Date.now()}`
        : 'assets/img/default-avatar.png';

      this.avatarUrlSubject.next(url);
      this.fotoPerfilSubject.next(url);
    }
  }

  /** Alias para actualizar solo la URL de la foto mostrada, sin tocar el usuario */
  actualizarFotoPerfil(url: string): void {
    this.fotoPerfilSubject.next(url);
  }

  /** Sube una nueva foto al servidor */
  subirFotoPerfil(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/${id}/foto`, formData);
  }
}
