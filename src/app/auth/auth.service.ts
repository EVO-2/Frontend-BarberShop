import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private rolUsuario = '';

  private usuarioSubject = new BehaviorSubject<any>(this.getUsuario());
  usuario$ = this.usuarioSubject.asObservable();

  // ✅ inicializar correctamente con el campo `foto`
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

          // Guardar token + usuario
          localStorage.setItem('token', resp.token);
          localStorage.setItem('usuario', JSON.stringify(usuarioPlano));

          // Notificar a los Subjects
          this.usuarioSubject.next(usuarioPlano);
          const nuevaUrl = this.getFotoUrl(usuarioPlano.foto); 
          this.avatarUrlSubject.next(nuevaUrl);
          this.fotoPerfilSubject.next(nuevaUrl);
        }
      })
    );
  }

  // 🔹 Método privado para normalizar el usuario
  private mapUsuario(usuario: any): Usuario {
    return {
      _id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      foto: usuario.foto ? usuario.foto : undefined,

      // =================== Cliente ===================
      cliente: usuario.cliente
        ? {
            _id: usuario.cliente._id,
            usuario: {
              _id: usuario._id,
              nombre: usuario.nombre,
              correo: usuario.correo,
              rol: usuario.rol,
              foto: usuario.foto ? usuario.foto : undefined,
            },
            telefono: usuario.cliente.telefono,
            direccion: usuario.cliente.direccion,
            genero: usuario.cliente.genero,
            fecha_nacimiento: usuario.cliente.fecha_nacimiento,
            fechaAlta: usuario.cliente.fechaAlta,
            estado: usuario.cliente.estado,
            createdAt: usuario.cliente.createdAt,
            updatedAt: usuario.cliente.updatedAt,
          }
        : undefined,

      // =================== Peluquero ===================
      peluquero: usuario.peluquero
        ? {
            _id: usuario.peluquero._id,
            usuario: usuario._id,
            especialidades: usuario.peluquero.especialidades,
            experiencia: usuario.peluquero.experiencia,
            telefono_profesional: usuario.peluquero.telefono_profesional,
            direccion_profesional: usuario.peluquero.direccion_profesional,
            genero: usuario.peluquero.genero,
            fecha_nacimiento: usuario.peluquero.fecha_nacimiento,
            sede: usuario.peluquero.sede,
            puestoTrabajo: usuario.peluquero.puestoTrabajo,
            estado: usuario.peluquero.estado,
            createdAt: usuario.peluquero.createdAt,
            updatedAt: usuario.peluquero.updatedAt,
          }
        : undefined,
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

  // =================== Usuario ===================
  guardarDatos(token: string, usuario: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.rolUsuario = usuario.rol;

    const fotoUrl = this.getFotoUrl(usuario.foto); 
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

  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  actualizarPerfil(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, formData);
  }

  refrescarUsuario(): void {
    this.http.get<any>(`${this.apiUrl}/perfil`).subscribe({
      next: (resp) => {
        const usuarioPlano = resp.usuario ? this.mapUsuario(resp.usuario) : resp;
        localStorage.setItem('usuario', JSON.stringify(usuarioPlano));
        this.usuarioSubject.next(usuarioPlano);

        const nuevaUrl = this.getFotoUrl(usuarioPlano.foto); 
        this.avatarUrlSubject.next(nuevaUrl);
        this.fotoPerfilSubject.next(nuevaUrl);
      },
      error: (error) => {
        console.error('❌ Error al refrescar usuario:', error);
      },
    });
  }

  // =================== Foto de Perfil ===================
  private getFotoUrl(foto?: string): string {
  if (!foto) {
    return 'assets/img/default-avatar.png'; 
  }

  // ✅ soporta si `foto` ya es URL completa o solo filename
  const esUrlCompleta = /^https?:\/\//i.test(foto);

  // 👇 usamos el host sin `/api/auth`
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
