import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly perfilUrl = 'http://localhost:3000/api/usuarios/perfil';
  private rolUsuario: string = '';

  private usuarioSubject = new BehaviorSubject<any>(this.getUsuario());
  usuario$ = this.usuarioSubject.asObservable();

  private avatarUrlSubject = new BehaviorSubject<string>(this.getFotoUrl(this.getUsuario()?.foto));
  avatarUrl$ = this.avatarUrlSubject.asObservable();

  private fotoPerfilSubject = new BehaviorSubject<string>(this.getFotoUrl(this.getUsuario()?.foto));
  fotoPerfil$ = this.fotoPerfilSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // =================== Autenticación ===================
  login(datos: { correo: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, datos).pipe(
      tap((resp: any) => {
        if (resp && resp.usuario) {
          const usuarioPlano = this.mapUsuario(resp.usuario);
          localStorage.setItem('token', resp.token);
          localStorage.setItem('usuario', JSON.stringify(usuarioPlano));
          this.usuarioSubject.next(usuarioPlano);

          const nuevaUrl = this.getFotoUrl(usuarioPlano.foto);
          this.avatarUrlSubject.next(nuevaUrl);
          this.fotoPerfilSubject.next(nuevaUrl);

          this.rolUsuario = String(usuarioPlano.rol);
        }
      })
    );
  }

  // Normaliza usuario, id/_id y rol
  private mapUsuario(usuario: any): Usuario {
    const idUsuario = usuario._id || usuario.id;
    return {
      _id: idUsuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: typeof usuario.rol === 'string' ? usuario.rol : usuario.rol?.nombre || '',
      foto: usuario.foto || undefined,
      cliente: usuario.cliente
        ? { ...usuario.cliente, _id: usuario.cliente._id, usuario: idUsuario }
        : undefined,
      peluquero: usuario.peluquero
        ? { ...usuario.peluquero, _id: usuario.peluquero._id, usuario: idUsuario }
        : undefined
    };
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

  guardarDatos(token: string, usuario: any): void {
    const usuarioPlano = this.mapUsuario(usuario);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioPlano));
    this.rolUsuario = String(usuarioPlano.rol);

    const fotoUrl = this.getFotoUrl(usuarioPlano.foto);
    this.usuarioSubject.next(usuarioPlano);
    this.avatarUrlSubject.next(fotoUrl);
    this.fotoPerfilSubject.next(fotoUrl);
  }

  getUsuario(): any {
    const data = localStorage.getItem('usuario');
    if (!data) return null;

    const usuario = JSON.parse(data);

    usuario.id = usuario.id || usuario._id || usuario.cliente?._id || usuario.peluquero?._id;
    usuario._id = usuario._id || usuario.id || usuario.cliente?._id || usuario.peluquero?._id;
    usuario.rol = typeof usuario.rol === 'string' ? usuario.rol : usuario.rol?.nombre || '';

    return usuario;
  }

  obtenerRol(): string {
    if (this.rolUsuario) return this.rolUsuario;
    const usuario = this.getUsuario();
    return usuario?.rol || '';
  }

  refrescarUsuario(): void {
    this.http.get<any>(this.perfilUrl).subscribe({
      next: (resp) => {
        const usuarioPlano = resp.usuario ? this.mapUsuario(resp.usuario) : resp;
        localStorage.setItem('usuario', JSON.stringify(usuarioPlano));
        this.usuarioSubject.next(usuarioPlano);

        const nuevaUrl = this.getFotoUrl(usuarioPlano.foto);
        this.avatarUrlSubject.next(nuevaUrl);
        this.fotoPerfilSubject.next(nuevaUrl);

        this.rolUsuario = usuarioPlano.rol;
      },
      error: (error) => console.error('❌ Error al refrescar usuario:', error),
    });
  }

  setUsuarioActual(usuario: any): void {
    const usuarioPlano = this.mapUsuario(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuarioPlano));
    this.usuarioSubject.next(usuarioPlano);

    if (usuarioPlano.foto) {
      const urlFoto = this.getFotoUrl(usuarioPlano.foto);
      this.avatarUrlSubject.next(urlFoto);
      this.fotoPerfilSubject.next(urlFoto);
    }

    this.rolUsuario = String(usuarioPlano.rol);
  }

  private getFotoUrl(foto?: string): string {
    if (!foto) return 'assets/img/default-avatar.png';

    const esUrlCompleta = /^https?:\/\//i.test(foto);
    const serverBase = 'http://localhost:3000';
    const base = esUrlCompleta ? foto : `${serverBase}/uploads/${foto}`;
    return `${base}${base.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }

  getUsuarioActual(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  actualizarFoto(nombreArchivo: string | null): void {
    const usuario = this.getUsuarioActual();
    if (usuario) {
      usuario.foto = nombreArchivo;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      this.usuarioSubject.next(usuario);

      const url = nombreArchivo
        ? this.getFotoUrl(nombreArchivo)
        : 'assets/img/default-avatar.png';

      this.avatarUrlSubject.next(url);
      this.fotoPerfilSubject.next(url);
    }
  }

  subirFotoPerfil(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/${id}/foto`, formData);
  }
}
