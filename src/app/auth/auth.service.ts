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

    // 1. Extraemos el ID del usuario (colección 'usuarios')
    const idUsuario = usuario._id || usuario.id;

    // 2. Normalización del Rol
    const nombreRol = (typeof usuario.rol === 'string'
      ? usuario.rol
      : (usuario.rol?.nombre || '')).toLowerCase();

    // 3. Función de limpieza interna para detectar strings mal formados (Fix Railway)
    const normalizarEntidad = (data: any) => {
      if (!data) return undefined;

      // Si el backend envió un string que parece un objeto (error de serialización)
      if (typeof data === 'string' && (data.includes('_id') || data.includes('ObjectId'))) {
        console.warn("⚠️ Normalizando string de inspección detectado en la entidad");
        const match = data.match(/ObjectId\(['"](.+?)['"]\)/) || data.match(/_id:\s*['"](.+?)['"]/);
        if (match) return { _id: match[1], usuario: idUsuario };
      }

      // Si es un string simple (solo el ID)
      if (typeof data === 'string') {
        return { _id: data, usuario: idUsuario };
      }

      // Si es un objeto real de JS
      return {
        ...data,
        _id: data._id || data.id,
        usuario: idUsuario
      };
    };

    return {
      _id: idUsuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: nombreRol,
      foto: usuario.foto || undefined,

      // 🔐 Permisos: Intentamos obtenerlos de la raíz o del objeto rol populado
      permisos: usuario.permisos || (usuario.rol?.permisos?.map((p: any) => p.nombre) || []),

      /**
       * 👤 CLIENTE: 
       * Aplicamos la normalización para limpiar el string sucio visto en logs de Railway
       */
      cliente: (nombreRol === 'cliente')
        ? normalizarEntidad(usuario.cliente)
        : undefined,

      /**
       * ✂️ PELUQUERO / PROFESIONAL:
       * Buscamos en 'peluquero', 'manicurista' o 'barbero' según el rol
       */
      peluquero: (nombreRol === 'barbero' || nombreRol === 'manicurista')
        ? normalizarEntidad(usuario.peluquero || usuario.manicurista || usuario.barbero)
        : undefined,

      /**
       * 💅 MANICURISTA: 
       * Mantenemos por compatibilidad específica si el componente lo requiere por separado
       */
      manicurista: (nombreRol === 'manicurista')
        ? normalizarEntidad(usuario.manicurista)
        : undefined
    };
  }

}