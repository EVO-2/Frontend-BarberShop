import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { PeluqueroService } from 'src/app/core/services/peluquero.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  usuario: any;
  rol: string = '';
  fotoPerfilUrl: string = 'assets/img/default-avatar.png';
  ocultarPassword: boolean = true;

  esCliente = false;
  esPeluquero = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private clienteService: ClienteService,
    private peluqueroService: PeluqueroService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual();
    console.log('[PerfilComponent] Usuario obtenido de AuthService:', this.usuario);

    if (!this.usuario) {
      console.warn('[PerfilComponent] ❌ No hay usuario logueado, abortando carga de perfil');
      return;
    }

    this.rol = this.usuario.rol?.nombre || this.usuario.rol || '';
    console.log('[PerfilComponent] Rol detectado:', this.rol);

    this.fotoPerfilUrl = this.obtenerFotoUrl(this.usuario.foto);
    console.log('[PerfilComponent] Foto de perfil inicial:', this.fotoPerfilUrl);

    // 🔹 Ajustamos roles
    this.esCliente = this.rol === 'cliente';
    this.esPeluquero = this.rol === 'peluquero' || this.rol === 'barbero';
    console.log('[PerfilComponent] esCliente:', this.esCliente, '| esPeluquero:', this.esPeluquero);

    this.inicializarFormulario();

    if (this.esCliente) {
      console.log('[PerfilComponent] Cargando datos de cliente para usuarioId:', this.usuario._id);
      this.cargarDatosCliente();
    }

    if (this.esPeluquero) {
      console.log('[PerfilComponent] Cargando datos de peluquero desde usuario:', this.usuario._id);
      this.cargarDatosPeluquero();
    }
  }

  private inicializarFormulario(): void {
    console.log('[PerfilComponent] Inicializando formulario con usuario:', this.usuario);

    this.perfilForm = this.fb.group({
      // 🔹 Campos de Usuario
      nombre: [this.usuario?.nombre || '', Validators.required],
      correo: [this.usuario?.correo || '', [Validators.required, Validators.email]],
      actual: [''], // siempre vacío
      nueva: [''], // siempre vacío
      confirmarPassword: [''], // siempre vacío

      // 🔹 Campos comunes
      telefono: [''],
      direccion: [''],
      genero: [''],
      fecha_nacimiento: [''],

      // 🔹 Campos exclusivos de Peluquero
      especialidades: [[]],
      experiencia: [''],
      telefono_profesional: [''],
      direccion_profesional: [''],
      sede: [''],
      puestoTrabajo: ['']
    });
  }

  private cargarDatosCliente(): void {
    const usuarioId = this.usuario?._id;
    if (!usuarioId) return;

    this.clienteService.obtenerPorUsuarioId(usuarioId).subscribe({
      next: cliente => {
        console.log('[PerfilComponent] Datos de cliente recibidos:', cliente);
        this.perfilForm.patchValue({
          telefono: cliente.telefono || '',
          direccion: cliente.direccion || '',
          genero: cliente.genero || '',
          fecha_nacimiento: cliente.fecha_nacimiento || ''
        });
      },
      error: err => console.error('[PerfilComponent] ❌ Error cargando cliente:', err)
    });
  }

  private cargarDatosPeluquero(): void {
    const peluquero = this.usuario?.peluquero;
    console.log('[PerfilComponent] Datos de peluquero obtenidos desde usuario:', peluquero);

    if (!peluquero) {
      console.warn('[PerfilComponent] ⚠️ Usuario no tiene datos de peluquero asociados');
      return;
    }

    this.perfilForm.patchValue({
      especialidades: peluquero.especialidades || [],
      experiencia: peluquero.experiencia || '',
      telefono_profesional: peluquero.telefono_profesional || '',
      direccion_profesional: peluquero.direccion_profesional || '',
      genero: peluquero.genero || '',
      fecha_nacimiento: peluquero.fecha_nacimiento || '',
      sede: peluquero.sede || '',
      puestoTrabajo: peluquero.puestoTrabajo || ''
    });
  }

  obtenerFotoUrl(foto: string): string {
    const url = foto ? `${environment.baseUrl}/uploads/${foto}` : 'assets/img/default-avatar.png';
    console.log('[PerfilComponent] obtenerFotoUrl() ->', url);
    return url;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    // Vista previa inmediata
    const reader = new FileReader();
    reader.onload = () => (this.fotoPerfilUrl = reader.result as string);
    reader.readAsDataURL(file);

    // Subir al backend
    const id = this.usuario?._id;
    if (!id) {
      console.error('[PerfilComponent] ❌ No hay _id de usuario para subir foto');
      return;
    }

    const formData = new FormData();
    formData.append('foto', file);

    this.usuarioService.actualizarFoto(id, formData).subscribe({
      next: res => {
        console.log('[PerfilComponent] ✅ Foto actualizada correctamente:', res);
        if (res.foto) {
          this.fotoPerfilUrl = this.obtenerFotoUrl(res.foto);
          this.authService.actualizarFoto(res.foto);
        }
      },
      error: err => console.error('[PerfilComponent] ❌ Error al actualizar foto:', err)
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid || !this.usuario) {
      console.warn('[PerfilComponent] ⚠️ Formulario inválido o usuario no definido');
      return;
    }

    const formValues = this.perfilForm.value;
    const usuarioId = this.usuario._id;
    if (!usuarioId) {
      console.error('[PerfilComponent] ❌ No se encontró _id de usuario');
      return;
    }

    // 1️⃣ Actualizar datos básicos de Usuario
    const usuarioPayload = {
      nombre: formValues.nombre,
      correo: formValues.correo
    };

    this.usuarioService.actualizarUsuario(usuarioId, usuarioPayload).subscribe({
      next: res => {
        console.log('[PerfilComponent] ✅ Usuario actualizado:', res);
        if (res.foto) this.authService.actualizarFoto(res.foto);
      },
      error: err => console.error('[PerfilComponent] ❌ Error al actualizar usuario:', err)
    });

    // 2️⃣ Cambiar contraseña si el usuario escribe una nueva
    if (formValues.nueva && formValues.confirmarPassword) {
      if (formValues.nueva !== formValues.confirmarPassword) {
        console.warn('[PerfilComponent] ⚠️ La nueva contraseña y su confirmación no coinciden');
      } else {
        this.usuarioService.cambiarPassword(usuarioId, { actual: formValues.actual, nueva: formValues.nueva }).subscribe({
          next: res => console.log('[PerfilComponent] ✅ Contraseña cambiada:', res),
          error: err => console.error('[PerfilComponent] ❌ Error cambiando contraseña:', err)
        });
      }
    }

    // 3️⃣ Actualizar datos de Cliente
    if (this.esCliente) {
      const clientePayload = {
        telefono: formValues.telefono,
        direccion: formValues.direccion,
        genero: formValues.genero,
        fecha_nacimiento: formValues.fecha_nacimiento
      };

      this.clienteService.actualizarPorUsuarioId(usuarioId, clientePayload).subscribe({
        next: res => console.log('[PerfilComponent] ✅ Cliente actualizado:', res),
        error: err => console.error('[PerfilComponent] ❌ Error actualizando cliente:', err)
      });
    }

    // 4️⃣ Actualizar datos de Peluquero
    if (this.esPeluquero) {
      const peluqueroPayload = {
        especialidades: formValues.especialidades || [],
        experiencia: formValues.experiencia,
        telefono_profesional: formValues.telefono_profesional,
        direccion_profesional: formValues.direccion_profesional,
        genero: formValues.genero,
        fecha_nacimiento: formValues.fecha_nacimiento,
        sede: formValues.sede,
        puestoTrabajo: formValues.puestoTrabajo
      };

      this.peluqueroService.actualizarPorUsuarioId(usuarioId, peluqueroPayload).subscribe({
        next: res => console.log('[PerfilComponent] ✅ Peluquero actualizado:', res),
        error: err => console.error('[PerfilComponent] ❌ Error actualizando peluquero:', err)
      });
    }
  }

  cancelarCambios(): void {
    console.log('[PerfilComponent] Cancelando edición, redirigiendo a /dashboard');
    this.router.navigate(['/dashboard']);
  }
}
