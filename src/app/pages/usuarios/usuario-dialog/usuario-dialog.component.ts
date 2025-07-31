import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { AuthService } from 'src/app/auth/auth.service';
import { RolService } from 'src/app/core/services/rol.service';
import { SedeService } from 'src/app/core/services/sede.service';
import { PuestoService } from 'src/app/core/services/puesto.service';
import { PeluqueroService } from 'src/app/core/services/peluquero.service';
import { emailExisteValidator } from 'src/app/shared/validators/email-existe.validator';
import { telefonoValido } from 'src/app/shared/validators/validators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-usuario-dialog',
  templateUrl: './usuario-dialog.component.html',
  styleUrls: ['./usuario-dialog.component.scss']
})
export class UsuarioDialogComponent implements OnInit, AfterViewInit {
  editarModo: boolean = false;
  usuarioForm!: FormGroup;
  titulo: string = 'Crear Usuario';
  roles: any[] = [];
  sedes: any[] = [];
  puestos: any[] = [];
  isSubmitting = false;
  rolSeleccionado: string = '';
  hidePassword = true;
  boton: string = this.data?.modo === 'editar' ? 'Actualizar' : 'Guardar';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private sedeService: SedeService,
    private puestoService: PuestoService,
    private peluqueroService: PeluqueroService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.cargarRoles();     
    this.cargarSedes();
    this.inicializarFormulario();

    this.usuarioForm.get('sede')?.valueChanges.subscribe((sedeId: string) => {
      if (this.rolSeleccionado === 'barbero' || this.rolSeleccionado === 'peluquero') {
        this.cargarPuestos(sedeId);
      }
    });

    this.usuarioForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.rolSeleccionado = rol;
      this.agregarCamposPorRol(rol);
      this.onRolChange(rol);
    });

    // =================== MODO EDITAR ===================
    if (this.data?.modo === 'editar') {
      this.titulo = 'Editar Usuario';
      this.editarModo = true;

      const usuario = this.data.usuario;
      this.rolSeleccionado = usuario.rol;

      this.agregarCamposPorRol(this.rolSeleccionado);

      if (this.rolSeleccionado === 'barbero' && usuario.peluquero?.sede) {
        this.cargarPuestos(usuario.peluquero.sede._id);
      }

      setTimeout(() => {
        // Patch de campos comunes
        this.usuarioForm.patchValue({
          nombre: usuario.nombre,
          correo: usuario.correo,
          estado: usuario.estado,
          rol: usuario.rol
        });

        // Patch de campos de peluquero/barbero
        if (usuario.peluquero) {
          this.usuarioForm.patchValue({
            especialidad: usuario.peluquero.especialidades || '',
            experiencia: usuario.peluquero.experiencia || '',
            telefono_profesional: usuario.peluquero.telefono_profesional || '',
            direccion_profesional: usuario.peluquero.direccion_profesional || '',
            genero: usuario.peluquero.genero || '',
            fecha_nacimiento: usuario.peluquero.fecha_nacimiento?.split('T')[0] || '',
            sede: usuario.peluquero.sede?._id || '',
            puesto_id: usuario.peluquero.puestoTrabajo?._id || ''
          });
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.usuarioForm.statusChanges.subscribe(status => {
      console.log('🔍 Estado del formulario:', status);
      console.log('📝 Valores del formulario:', this.usuarioForm.value);
    });
  }

  cargarRoles(): void {
    this.rolService.obtenerRoles().subscribe({
      next: (res) => (this.roles = res),
      error: (err) => console.error('Error cargando roles:', err)
    });
  }

  cargarSedes(): void {
    this.sedeService.getSedes().subscribe({
      next: (res) => (this.sedes = res),
      error: (err) => console.error('Error cargando sedes:', err)
    });
  }

  cargarPuestos(sedeId?: string): void {
    this.puestoService.getPuestos(sedeId).subscribe({
      next: (res) => (this.puestos = res),
      error: (err) => console.error('Error cargando puestos:', err)
    });
  }

  inicializarFormulario(): void {
    const usuario = this.data?.usuario || {};

    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      correo: ['', [Validators.required, Validators.email], [emailExisteValidator(this.authService)]],
      rol: ['', Validators.required],
      estado: [true, Validators.required],
      password: [
        '',
        this.data?.modo !== 'editar'
          ? [
              Validators.required,
              Validators.minLength(8),
              Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/)
            ]
          : []
      ]
    });

    if (usuario.rol === 'barbero') {
      this.aplicarValidadoresBarbero();
    }

    this.usuarioForm.get('rol')?.valueChanges.subscribe((rol: string) => {
      if (rol === 'barbero') {
        this.aplicarValidadoresBarbero();
      } else {
        this.removerValidadoresBarbero();
      }
    });
  }

  aplicarValidadoresBarbero(): void {
    const campos = [
      'especialidad', 'experiencia', 'telefono_profesional',
      'direccion_profesional', 'genero', 'fecha_nacimiento',
      'sede', 'puesto_id'
    ];

    campos.forEach(campo => {
      const control = this.usuarioForm.get(campo);
      control?.setValidators(Validators.required);
      control?.updateValueAndValidity();
    });
  }

  removerValidadoresBarbero(): void {
    const campos = [
      'especialidad', 'experiencia', 'telefono_profesional',
      'direccion_profesional', 'genero', 'fecha_nacimiento',
      'sede', 'puesto_id'
    ];

    campos.forEach(campo => {
      const control = this.usuarioForm.get(campo);
      control?.clearValidators();
      control?.updateValueAndValidity();
    });
  }

  onRolChange(rol: string): void {
    const puestoControl = this.usuarioForm.get('puesto_id');
    if (rol === 'barbero' || rol === 'peluquero') {
      const sedeId = this.usuarioForm.get('sede')?.value;
      if (sedeId) this.cargarPuestos(sedeId);
      puestoControl?.setValidators([Validators.required]);
    } else {
      puestoControl?.reset();
      puestoControl?.clearValidators();
    }
    puestoControl?.updateValueAndValidity();
  }

  agregarCamposPorRol(rol: string): void {
    const camposAEliminar = [
      'telefono', 'direccion', 'genero', 'fecha_nacimiento',
      'especialidad', 'experiencia', 'telefono_profesional',
      'direccion_profesional', 'sede', 'puesto_id'
    ];

    camposAEliminar.forEach(campo => {
      if (this.usuarioForm.contains(campo)) {
        this.usuarioForm.removeControl(campo);
      }
    });

    if (rol === 'cliente') {
      this.usuarioForm.addControl('telefono', this.fb.control('', [Validators.required, telefonoValido()]));
      this.usuarioForm.addControl('direccion', this.fb.control('', Validators.required));
      this.usuarioForm.addControl('genero', this.fb.control('', Validators.required));
      this.usuarioForm.addControl('fecha_nacimiento', this.fb.control('', Validators.required));
    }

    if (rol === 'peluquero' || rol === 'barbero') {
      this.usuarioForm.addControl('especialidad', this.fb.control('', Validators.required));
      this.usuarioForm.addControl('experiencia', this.fb.control('', Validators.required));
      this.usuarioForm.addControl('telefono_profesional', this.fb.control('', [Validators.required, telefonoValido()]));
      this.usuarioForm.addControl('direccion_profesional', this.fb.control('', Validators.required));
      this.usuarioForm.addControl('genero', this.fb.control('', Validators.required));
      this.usuarioForm.addControl('fecha_nacimiento', this.fb.control('', Validators.required));
      this.usuarioForm.addControl('sede', this.fb.control('', Validators.required));
      this.usuarioForm.addControl('puesto_id', this.fb.control('', Validators.required));
    }
  }

  guardar(): void {
    if (this.usuarioForm.invalid) return;

    const usuarioData = { ...this.usuarioForm.value };

    if (usuarioData.fecha_nacimiento instanceof Date) {
      usuarioData.fecha_nacimiento = usuarioData.fecha_nacimiento.toISOString().split('T')[0];
    }

    console.log('✅ Valores del formulario:\n', JSON.stringify(usuarioData, null, 2));
    this.isSubmitting = true;

    const request$ = this.data?.modo === 'editar'
      ? this.usuarioService.actualizarUsuario(this.data.usuario._id, usuarioData)
      : this.usuarioService.crearUsuario(usuarioData);

    request$.subscribe({
      next: (res) => {
        if (this.usuarioForm.value.rol === 'barbero' && this.data?.modo === 'editar' && this.data?.peluquero?._id) {
          this.actualizarPeluquero(this.data.peluquero._id);
        } else {
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        console.error('Error al guardar usuario', err);
        this.isSubmitting = false;
      }
    });
  }

  actualizarPeluquero(id: string): void {
    const { sede, puesto_id } = this.usuarioForm.value;

    const data = {
      sede,
      puestoTrabajo: puesto_id
    };

    this.peluqueroService.actualizarPeluquero(id, data).subscribe({
      next: () => {
        this.snackBar.open('Peluquero actualizado con éxito', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(err.error.msg || 'Error al actualizar peluquero', 'Cerrar', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }
}
