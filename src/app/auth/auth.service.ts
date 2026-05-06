import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../shared/models/usuario.model';
import { BiometricService } from '../services/biometric.service';

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
    private router: Router,
    private biometricService: BiometricService
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
        // 1. Guardar el token de seguridad
        if (resp?.token) {
          localStorage.setItem('token', resp.token);
        }

        // 2. Procesar y guardar la información del usuario
        if (resp?.usuario) {
          /**
           * 🔥 EL PASO CRÍTICO:
           * Usamos mapUsuario para limpiar el formato "new ObjectId" del backend
           * y estructurar correctamente las entidades (cliente/peluquero).
           */
          const usuarioMapeado = this.mapUsuario(resp.usuario);

          // Persistencia en LocalStorage (JSON limpio)
          localStorage.setItem('usuario', JSON.stringify(usuarioMapeado));

          // Notificar a todos los componentes suscritos al Observable usuario$
          this.usuarioSubject.next(usuarioMapeado);

          // Actualizar la foto de perfil en el Subject correspondiente
          const fotoUrl = this.getFotoUrl(usuarioMapeado.foto);
          this.fotoPerfilSubject.next(fotoUrl);

          // Sincronizar el rol para métodos internos de validación
          this.rolUsuario = String(usuarioMapeado.rol);
        }
      })
    );
  }

  registro(nuevoUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, nuevoUsuario);
  }

  // 🔥 Registro SaaS Multi-Tenant (Onboarding)
  registroSaaS(datosOnboarding: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/onboarding/registrar`, datosOnboarding);
  }

  verificarCorreo(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-correo`, { correo: email });
  }

  cerrarSesion(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // 🔥 Limpiar el token biométrico para evitar auto-logins con tokens expirados
    this.biometricService.clearToken();

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

      /**
       * 🆔 NORMALIZACIÓN DE IDS
       * Aseguramos que usuario._id siempre sea el ID de la cuenta (User Collection).
       * No mezclamos con cliente._id aquí para evitar conflictos en el perfil.
       */
      const idCuenta = usuario._id || usuario.id;
      usuario._id = idCuenta;
      usuario.id = idCuenta;

      /**
       * 🎭 NORMALIZACIÓN DE ROL
       * Siempre devolvemos el string del nombre del rol para facilitar 
       * las validaciones de Guards y Directivas en el HTML.
       */
      usuario.rol = typeof usuario.rol === 'string'
        ? usuario.rol
        : (usuario.rol?.nombre || '');

      /**
       * 🛡️ GARANTÍA DE ENTIDADES
       * Si el objeto fue guardado correctamente por mapUsuario, 
       * las propiedades 'cliente' o 'peluquero' ya vendrán como objetos.
       */
      return usuario;

    } catch (error) {
      console.error('❌ Error al recuperar usuario del storage:', error);
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
        // 🔥 opcional pero PRO
        if (error.status === 401) {
          console.warn('⚠️ Sesión expirada o token inválido. Cerrando sesión...');
          this.cerrarSesion(); // token inválido o expirado
        } else {
          console.error('❌ Error al refrescar usuario:', error);
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
    // 1. Extraemos el ID del usuario (colección 'usuarios')
    const idUsuario = usuario._id || usuario.id;

    // 2. Normalización del Rol
    const nombreRol = (typeof usuario.rol === 'string'
      ? usuario.rol
      : (usuario.rol?.nombre || '')).toLowerCase();

    /**
     * 🧹 Función de limpieza interna (Anti-basura Railway/Mongo)
     */
    const normalizarEntidad = (data: any) => {
      if (!data) return undefined;

      let idExtraido: string | null = null;

      // Caso A: string tipo "new ObjectId(...)"
      if (typeof data === 'string' && (data.includes('_id') || data.includes('ObjectId'))) {
        console.warn("⚠️ Normalizando string de inspección detectado en la entidad");
        const match = data.match(/[0-9a-fA-F]{24}/);
        if (match) idExtraido = match[0];
      }
      // Caso B: string simple
      else if (typeof data === 'string') {
        idExtraido = data;
      }
      // Caso C: objeto
      else if (typeof data === 'object') {
        idExtraido = data._id || data.id;
      }

      return idExtraido ? {
        _id: idExtraido,
        usuario: idUsuario,
        ...(typeof data === 'object' ? data : {})
      } : undefined;
    };

    // 🔥 NORMALIZACIONES CLAVE (aquí está la corrección real)
    const clienteNormalizado = normalizarEntidad(usuario.cliente);
    const peluqueroNormalizado = normalizarEntidad(
      usuario.peluquero || usuario.manicurista || usuario.barbero
    );
    const manicuristaNormalizado = normalizarEntidad(usuario.manicurista);

    const usuarioNormalizado: Usuario = {
      _id: idUsuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: nombreRol,
      foto: usuario.foto || undefined,

      // 🔐 Permisos
      permisos: usuario.permisos || (usuario.rol?.permisos?.map((p: any) => p.nombre) || []),

      /**
       * 👤 CLIENTE (FIX CRÍTICO)
       * - SI viene en backend → usarlo SIEMPRE
       * - SOLO fallback a usuario._id si no existe (casos legacy)
       */
      cliente: clienteNormalizado
        ? clienteNormalizado
        : (nombreRol === 'cliente'
          ? { _id: idUsuario, usuario: idUsuario }
          : undefined),

      /**
       * ✂️ PELUQUERO
       */
      peluquero: peluqueroNormalizado
        ? peluqueroNormalizado
        : (nombreRol === 'barbero'
          ? { _id: idUsuario, usuario: idUsuario }
          : undefined),

      /**
       * 💅 MANICURISTA
       */
      manicurista: manicuristaNormalizado
        ? manicuristaNormalizado
        : (nombreRol === 'manicurista'
          ? { _id: idUsuario, usuario: idUsuario }
          : undefined)
    };

    return usuarioNormalizado;
  }

}