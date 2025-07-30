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
  fotoPerfilUrl: string = 'assets/default.jpg';
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
    if (!this.usuario) return;

    this.rol = this.usuario.rol?.nombre || '';
    this.fotoPerfilUrl = this.obtenerFotoUrl(this.usuario.foto);

    this.esCliente = this.rol === 'cliente';
    this.esPeluquero = this.rol === 'peluquero';

    this.inicializarFormulario();

    if (this.esCliente) this.cargarDatosCliente();
    if (this.esPeluquero) this.cargarDatosPeluquero();
  }

  private inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      nombre: [this.usuario?.nombre || '', Validators.required],
      actual: [''],
      nueva: [''],
      telefono: [''],
      especialidad: ['']
    });
  }

  private cargarDatosCliente(): void {
    this.clienteService.obtenerPorUsuarioId(this.usuario.id).subscribe({
      next: cliente => {
        this.perfilForm.patchValue({ telefono: cliente.telefono });
      },
      error: err => console.error('Error al cargar datos del cliente:', err)
    });
  }

  private cargarDatosPeluquero(): void {
    this.peluqueroService.obtenerPorUsuarioId(this.usuario.id).subscribe({
      next: peluquero => {
        this.perfilForm.patchValue({
          telefono: peluquero.telefono,
          especialidad: peluquero.especialidad
        });
      },
      error: err => console.error('Error al cargar datos del peluquero:', err)
    });
  }

  obtenerFotoUrl(foto: string): string {
    return foto ? `${environment.baseUrl}/uploads/${foto}` : 'assets/default.jpg';
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    this.usuarioService.actualizarFoto(this.usuario.id, formData).subscribe({
      next: res => {
        this.fotoPerfilUrl = this.obtenerFotoUrl(res.foto);
        this.authService.actualizarFoto(res.foto);
      },
      error: err => console.error('Error al actualizar la foto de perfil:', err)
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid || !this.usuario) return;

    const { nombre, telefono, especialidad, actual, nueva } = this.perfilForm.value;

    // Actualizar nombre
    this.usuarioService.actualizarUsuario(this.usuario.id, { nombre }).subscribe({
      next: res => {
        this.authService.actualizarFoto(res.foto);
      },
      error: err => console.error('Error actualizando nombre:', err)
    });

    // Cambiar contraseña (si se ingresan ambas)
    if (actual && nueva) {
      this.usuarioService.cambiarPassword(this.usuario.id, { actual, nueva }).subscribe({
        next: () => console.log('Contraseña actualizada correctamente'),
        error: err => console.error('Error al cambiar contraseña:', err)
      });
    }

    // Actualizar datos específicos según el rol
    if (this.esCliente) {
      this.clienteService.actualizarPorUsuarioId(this.usuario.id, { telefono }).subscribe({
        next: () => console.log('Teléfono del cliente actualizado'),
        error: err => console.error('Error al actualizar cliente:', err)
      });
    }

    if (this.esPeluquero) {
      this.peluqueroService.actualizarPorUsuarioId(this.usuario.id, { telefono, especialidad }).subscribe({
        next: () => console.log('Datos del peluquero actualizados'),
        error: err => console.error('Error al actualizar peluquero:', err)
      });
    }
  }

  cancelarCambios(): void {
    this.router.navigate(['/dashboard']);
  }
}
