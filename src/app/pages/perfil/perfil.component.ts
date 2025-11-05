import { Component, OnInit } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  sedes: any[] = [];
  puestos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    if (!this.usuario) return;

    this.usuario.id = this.usuario.id || this.usuario._id || this.usuario.cliente?._id || this.usuario.peluquero?._id;
    this.usuario._id = this.usuario.id;

    this.rol = (this.usuario.rol && this.usuario.rol.nombre) ? this.usuario.rol.nombre : this.usuario.rol || '';
    this.esCliente = this.rol === 'cliente';
    this.esPeluquero = this.rol === 'peluquero' || this.rol === 'barbero';
    this.fotoPerfilUrl = this.obtenerFotoUrl(this.usuario.foto);

    this.inicializarFormulario();
    this.cargarSedes();
    this.cargarPerfil();
  }

  private inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      actual: [''],
      nueva: [''],
      confirmarPassword: [''],
      telefono: [''],
      direccion: [''],
      genero: [''],
      fecha_nacimiento: [''],
      especialidades: [''],
      experiencia: [''],
      telefono_profesional: [''],
      direccion_profesional: [''],
      sede: [''],
      puestoTrabajo: ['']
    });
  }

  private cargarSedes(): void {
    this.usuarioService.obtenerSedes().subscribe({
      next: (res) => this.sedes = res,
      error: (err) => console.error('Error cargando sedes:', err)
    });
  }

  private cargarPuestos(sedeId: string): void {
    if (!sedeId) return;
    this.usuarioService.obtenerPuestosDisponibles(sedeId).subscribe({
      next: (res) => this.puestos = res,
      error: (err) => console.error('Error cargando puestos:', err)
    });
  }

  private cargarPerfil(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (resp: any) => {
        const usuarioGeneral = resp.usuario || resp;
        const datosPeluquero = resp.peluquero || resp;
        const datosCliente = resp.cliente || resp;

        this.perfilForm.patchValue({
          nombre: usuarioGeneral.nombre || '',
          correo: usuarioGeneral.correo || ''
        });

        if (resp.tipo === 'cliente') {
          this.esCliente = true;
          this.perfilForm.patchValue({
            telefono: datosCliente.telefono || '',
            direccion: datosCliente.direccion || '',
            genero: datosCliente.genero || '',
            fecha_nacimiento: datosCliente.fecha_nacimiento || ''
          });
        }

        if (resp.tipo === 'barbero' || resp.tipo === 'peluquero') {
          this.esPeluquero = true;
          this.perfilForm.patchValue({
            telefono_profesional: datosPeluquero.telefono_profesional || '',
            direccion_profesional: datosPeluquero.direccion_profesional || '',
            genero: datosPeluquero.genero || '',
            fecha_nacimiento: datosPeluquero.fecha_nacimiento || '',
            experiencia: datosPeluquero.experiencia ?? '',
            especialidades: datosPeluquero.especialidades?.join(', ') || '',
            sede: datosPeluquero.sede?.nombre || '',
            puestoTrabajo: datosPeluquero.puestoTrabajo?.nombre || ''
          });

          if (datosPeluquero.sede?._id) {
            this.cargarPuestos(datosPeluquero.sede._id);
          }
        }
      },
      error: (err) => console.error('Error cargando perfil:', err)
    });
  }

  obtenerFotoUrl(foto: string): string {
    return foto ? `${environment.baseUrl}/uploads/${foto}` : 'assets/img/default-avatar.png';
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => (this.fotoPerfilUrl = reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('foto', file);

    this.usuarioService.actualizarFoto(this.usuario._id, formData).subscribe({
      next: (res) => {
        if (res.foto) {
          this.fotoPerfilUrl = this.obtenerFotoUrl(res.foto);
          this.authService.actualizarFoto(res.foto);
        }
      },
      error: (err) => console.error('Error al actualizar foto:', err)
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid) return;

    const formValues = this.perfilForm.value;
    const payload: any = {
      nombre: formValues.nombre,
      correo: formValues.correo,
      genero: formValues.genero,
      fecha_nacimiento: formValues.fecha_nacimiento
    };

    if (this.esCliente) {
      payload.telefono = formValues.telefono;
      payload.direccion = formValues.direccion;
    }

    if (this.esPeluquero) {
      payload.especialidades = formValues.especialidades
        ? formValues.especialidades.split(',').map((e: string) => e.trim())
        : [];
      payload.experiencia = formValues.experiencia;
      payload.telefono_profesional = formValues.telefono_profesional;
      payload.direccion_profesional = formValues.direccion_profesional;
    }

    // 🔹 Llamada a backend con snackbar
    this.usuarioService.actualizarPerfil(payload).subscribe({
      next: (resp) => {
        console.log("[PerfilComponent] ✅ Perfil actualizado:", resp);
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.usuario = resp.usuario;
        this.authService.setUsuarioActual(resp.usuario);
      },
      error: (err) => {
        console.error("[PerfilComponent] ❌ Error actualizando perfil:", err);
        this.snackBar.open('Error al actualizar perfil', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });

    if (formValues.nueva && formValues.confirmarPassword && formValues.nueva === formValues.confirmarPassword) {
      this.usuarioService.cambiarPassword(this.usuario._id, { actual: formValues.actual, nueva: formValues.nueva }).subscribe({
        next: () => {
          this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        },
        error: (err) => {
          console.error('Error cambiando contraseña:', err);
          this.snackBar.open('Error al cambiar contraseña', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  cancelarCambios(): void {
    this.router.navigate(['/dashboard']);
  }
}
