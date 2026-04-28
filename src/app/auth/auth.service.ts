import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  public readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly perfilUrl = `${environment.apiUrl}/usuarios/perfil`;
  private rolUsuario: string = '';

  private usuarioSubject = new BehaviorSubject<any>(this.getUsuario());
  usuario$ = this.usuarioSubject.asObservable();

  private fotoPerfilSubject = new BehaviorSubject<string>(
    this.getFotoUrl(this.getUsuario()?.foto)
  );
  fotoPerfil$ = this.fotoPerfilSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // 🔹 Sincronización entre pestañas del navegador
    window.addEventListener('storage', (event) => {
      if (event.key === 'usuario') {
        const usuario = this.getUsuario();

        this.usuarioSubject.next(usuario);

        const nuevaFoto = this.getFotoUrl(usuario?.foto);
        this.fotoPerfilSubject.next(nuevaFoto);
      }
    });
  }

  // =================== AUTENTICACIÓN ===================

  login(datos: { correo: string; password: string }): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/login`, datos).pipe(

      tap((resp: any) => {

        if (resp?.token) {
          localStorage.setItem('token', resp.token);
        }

        if (resp?.usuario) {

          const usuarioPlano = this.mapUsuario(resp.usuario);

          localStorage.setItem('usuario', JSON.stringify(usuarioPlano));

          this.usuarioSubject.next(usuarioPlano);

          const nuevaUrl = this.getFotoUrl(usuarioPlano.foto);
          this.fotoPerfilSubject.next(nuevaUrl);

          this.rolUsuario = String(usuarioPlano.rol);
        }

      })

    );
  }

  registro(nuevoUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, nuevoUsuario);
  }

  verificarCorreo(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-correo`, { correo: email });
  }

  cerrarSesion(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.usuarioSubject.next(null);

    this.fotoPerfilSubject.next('assets/img/default-avatar.png');

    this.router.navigate(['/login']);
  }

  logout(): void {
    this.cerrarSesion();
  }

  // =================== TOKEN ===================

  getToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  guardarDatos(token: string, usuario?: any): void {
    console.log('💾 Guardando usuario:', usuario);

    if (token) {
      localStorage.setItem('token', token);
    }

    if (usuario) {

      const usuarioPlano = this.mapUsuario(usuario);

      localStorage.setItem('usuario', JSON.stringify(usuarioPlano));

      this.usuarioSubject.next(usuarioPlano);

      const fotoUrl = this.getFotoUrl(usuarioPlano.foto);
      this.fotoPerfilSubject.next(fotoUrl);

      this.rolUsuario = String(usuarioPlano.rol);
    }
  }

  // =================== USUARIO ===================

  getUsuario(): any {

    try {

      const data = localStorage.getItem('usuario');

      if (!data) return null;

      const usuario = JSON.parse(data);

      usuario.id =
        usuario.id ||
        usuario._id ||
        usuario.cliente?._id ||
        usuario.peluquero?._id;

      usuario._id =
        usuario._id ||
        usuario.id ||
        usuario.cliente?._id ||
        usuario.peluquero?._id;

      usuario.rol =
        typeof usuario.rol === 'string'
          ? usuario.rol
          : usuario.rol?.nombre || '';

      return usuario;

    } catch {
      return null;
    }
  }

  obtenerRol(): string {

    if (this.rolUsuario) return this.rolUsuario;

    return this.getUsuario()?.rol || '';
  }

  refrescarUsuario(): void {

    const token = this.getToken();

    if (!token) {
      console.warn('⚠️ No hay token, no se puede refrescar usuario');
      return;
    }

    this.http.get<any>(this.perfilUrl).subscribe({

      next: (resp) => {

        const usuarioPlano = resp.usuario
          ? this.mapUsuario(resp.usuario)
          : resp;

        localStorage.setItem('usuario', JSON.stringify(usuarioPlano));

        this.usuarioSubject.next(usuarioPlano);

        const nuevaUrl = this.getFotoUrl(usuarioPlano.foto);
        this.fotoPerfilSubject.next(nuevaUrl);

        this.rolUsuario = usuarioPlano.rol;

      },

      error: (error) => {
        console.error('❌ Error al refrescar usuario:', error);

        // 🔥 opcional pero PRO
        if (error.status === 401) {
          this.cerrarSesion(); // token inválido o expirado
        }
      }

    });
  }

  setUsuarioActual(usuario: any): void {

    const usuarioActual = this.getUsuario();

    const usuarioPlano = this.mapUsuario({
      ...usuario,
      foto: usuario?.foto ?? usuarioActual?.foto
    });

    localStorage.setItem('usuario', JSON.stringify(usuarioPlano));

    this.usuarioSubject.next(usuarioPlano);

    const urlFoto = usuarioPlano.foto
      ? this.getFotoUrl(usuarioPlano.foto)
      : 'assets/img/default-avatar.png';

    this.fotoPerfilSubject.next(urlFoto);

    this.rolUsuario = String(usuarioPlano.rol);
  }

  getUsuarioActual(): any {

    const usuario = localStorage.getItem('usuario');

    return usuario ? JSON.parse(usuario) : null;
  }

  // =================== FOTO PERFIL ===================

  actualizarFoto(nombreArchivo: string | null): void {

    const usuario = this.getUsuarioActual();

    if (!usuario) return;

    usuario.foto = nombreArchivo;

    localStorage.setItem('usuario', JSON.stringify(usuario));

    this.usuarioSubject.next(usuario);

    const url = nombreArchivo
      ? this.getFotoUrl(nombreArchivo)
      : 'assets/img/default-avatar.png';

    this.fotoPerfilSubject.next(url);
  }

  subirFotoPerfil(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/${id}/foto`, formData);
  }

  private getFotoUrl(foto?: string): string {

    if (!foto) return 'assets/img/default-avatar.png';

    if (foto.startsWith('http')) return foto;

    return `${environment.baseUrl}/uploads/${foto}?t=${Date.now()}`;
  }

  // =================== ID ===================

  getCurrentUserId(): string | null {

    const usuario = this.getUsuario();

    return usuario?._id || usuario?.id || null;
  }

  // =================== NORMALIZACIÓN ===================

  private mapUsuario(usuario: any): Usuario {
    console.log('🧪 mapUsuario input:', usuario);

    const idUsuario = usuario._id || usuario.id;

    return {
      _id: idUsuario,
      nombre: usuario.nombre,
      correo: usuario.correo,

      rol: typeof usuario.rol === 'string'
        ? usuario.rol
        : usuario.rol?.nombre || '',

      foto: usuario.foto || undefined,

      // 🔐 Permisos (CLAVE para tu problema anterior)
      permisos: usuario.permisos || [],

      // 👤 Cliente
      cliente: usuario.cliente
        ? (typeof usuario.cliente === 'string'
          ? { _id: usuario.cliente, usuario: idUsuario }
          : { ...usuario.cliente, _id: usuario.cliente._id, usuario: idUsuario })
        : undefined,

      // 💇 Peluquero
      peluquero: usuario.peluquero
        ? (typeof usuario.peluquero === 'string'
          ? { _id: usuario.peluquero, usuario: idUsuario }
          : { ...usuario.peluquero, _id: usuario.peluquero._id, usuario: idUsuario })
        : undefined,

      // 💅 Manicurista (🔥 NUEVO)
      manicurista: usuario.manicurista
        ? (typeof usuario.manicurista === 'string'
          ? { _id: usuario.manicurista, usuario: idUsuario }
          : { ...usuario.manicurista, _id: usuario.manicurista._id, usuario: idUsuario })
        : undefined
    };
  }

}