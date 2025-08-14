import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { SedeService } from 'src/app/core/services/sede.service';
import { RolService } from 'src/app/core/services/rol.service';
import { PuestoService } from 'src/app/core/services/puesto.service';
import { telefonoValido, passwordsIguales } from 'src/app/shared/validators/validators';
import { passwordSegura } from 'src/app/shared/validators/password-segura.validator';
import { emailExisteValidator } from 'src/app/shared/validators/email-existe.validator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-usuario-dialog',
  templateUrl: './usuario-dialog.component.html',
  styleUrls: ['./usuario-dialog.component.scss']
})
export class UsuarioDialogComponent implements OnInit {

  usuarioForm!: FormGroup;
  modo: 'crear' | 'editar' = 'crear';
  titulo: string = 'Crear Usuario';
  roles: any[] = [];
  sedes: any[] = [];
  puestosDisponibles: any[] = [];
  mostrarCamposCliente: boolean = false;
  mostrarCamposPeluquero: boolean = false;
  usuarioActualId: string = '';

  // Para lógica unificada con backend
  puestoTrabajoAnterior: string | null = null;
  estadoAnterior: boolean = true;

  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private sedeService: SedeService,
    private rolService: RolService,
    private puestoService: PuestoService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.modo = this.data?.modo === 'editar' ? 'editar' : 'crear';
    this.titulo = this.modo === 'editar' ? 'Editar Usuario' : 'Crear Usuario';
    this.usuarioActualId = this.data?.usuarioId || '';

    this.inicializarFormulario();
    this.cargarRoles();
    this.cargarSedes();

    this.usuarioForm.get('rol')?.valueChanges.subscribe((rolId) => {
      const rolSeleccionado = this.roles.find(r => r._id === rolId);
      const nombreRol = rolSeleccionado?.nombre || '';
      this.toggleCamposExtendidos(nombreRol);

      const puestoCtrl = this.usuarioForm.get('puestoTrabajo');
      if (nombreRol === 'barbero') {
        puestoCtrl?.setValidators([Validators.required]);

        // Validación de puesto
        puestoCtrl?.valueChanges.subscribe((puestoId) => {
          if (puestoId) {
            this.validarPuestoOcupado(puestoId);
          }
        });
      } else {
        puestoCtrl?.clearValidators();
        puestoCtrl?.setValue(null);
      }
      puestoCtrl?.updateValueAndValidity();
    });

    this.usuarioForm.get('sede')?.valueChanges.subscribe((sedeId) => {
      this.usuarioForm.get('puestoTrabajo')?.reset();
      this.cargarPuestosPorSede(sedeId);
    });

    if (this.modo === 'editar') {
      this.cargarUsuarioParaEditar(this.usuarioActualId);
    }
  }

  inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/)]],
      correo: [
        '',
        [Validators.required, Validators.email],
        this.modo === 'crear' ? [emailExisteValidator(this.authService)] : []
      ],
      password: ['', this.modo === 'crear' ? [Validators.required, passwordSegura()] : []],
      confirmarPassword: [''],
      rol: ['', Validators.required],
      estado: [true],
      telefono: ['', telefonoValido()],
      direccion: [''],
      genero: ['otro'],
      fecha_nacimiento: [''],
      especialidades: [[]],
      experiencia: [0, [Validators.min(0), Validators.pattern('^[0-9]+$')]],
      sede: [''],
      puestoTrabajo: [null]
    }, {
      validators: passwordsIguales('password', 'confirmarPassword')
    });
  }

  validarPuestoOcupado(puestoId: string): void {
  if (!puestoId) return;

  this.usuarioService.verificarPuesto(puestoId, this.usuarioActualId)
    .subscribe((disponible: boolean) => {
      const control = this.usuarioForm.get('puestoTrabajo');

      if (!disponible && puestoId !== this.puestoTrabajoAnterior) {
        // ❌ Puesto ocupado → asignar error
        control?.setErrors({ ocupado: true });
      } else {
        // ✅ Puesto libre → quitar error si existía
        const currentErrors = control?.errors;
        if (currentErrors) {
          delete currentErrors['ocupado'];
          control?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
        }
      }
    });
}


  cargarRoles(): void {
    this.rolService.obtenerRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: (err) => console.error('❌ Error cargando roles:', err)
    });
  }

  cargarSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: (sedes) => this.sedes = sedes,
      error: (err) => console.error('❌ Error cargando sedes:', err)
    });
  }

  cargarUsuarioParaEditar(usuarioId: string): void {
    this.usuarioService.obtenerUsuarioPorId(usuarioId).subscribe({
      next: (usuarioCompleto) => {
        const detalles = usuarioCompleto.detalles || {};
        const rol = usuarioCompleto.rol?.nombre || usuarioCompleto.rol;

        // Guardamos datos anteriores para lógica de liberación
        this.puestoTrabajoAnterior = detalles.puestoTrabajo?._id || detalles.puestoTrabajo || null;
        this.estadoAnterior = usuarioCompleto.estado;

        this.usuarioForm.patchValue({
          nombre: usuarioCompleto.nombre,
          correo: usuarioCompleto.correo,
          rol: usuarioCompleto.rol?._id || usuarioCompleto.rol,
          estado: usuarioCompleto.estado,
          telefono: detalles.telefono || detalles.telefono_profesional || '',
          direccion: detalles.direccion || detalles.direccion_profesional || '',
          genero: detalles.genero || 'otro',
          fecha_nacimiento: detalles.fecha_nacimiento || '',
          especialidades: detalles.especialidades || [],
          experiencia: detalles.experiencia || 0,
          sede: detalles.sede?._id || detalles.sede,
        });

        this.usuarioForm.get('correo')?.clearAsyncValidators();
        this.usuarioForm.get('correo')?.updateValueAndValidity();
        this.toggleCamposExtendidos(rol);

        if (detalles.sede) {
          const sedeId = detalles.sede._id || detalles.sede;
          const puestoIdSeleccionado = this.puestoTrabajoAnterior;
          this.cargarPuestosPorSede(sedeId, puestoIdSeleccionado || undefined);
        }
      },
      error: (err) => console.error('❌ Error al cargar usuario desde backend:', err)
    });
  }

 cargarPuestosPorSede(sedeId: string, puestoIdSeleccionado?: string): void {
  if (!sedeId) return;

  console.log('[UsuarioDialog] Cargando puestos para sede', sedeId, 'puestoIdSeleccionado:', puestoIdSeleccionado);

  const peluqueroId = this.modo === 'editar' ? this.usuarioActualId : undefined;
  console.log('[UsuarioDialog] peluqueroId enviado:', peluqueroId);

    this.puestoService.getPuestos(sedeId, peluqueroId).subscribe({
      next: (puestos) => {
        console.log('[UsuarioDialog] Puestos recibidos del backend:', puestos);

        // ✅ Asignamos directamente lo que envía el backend
        this.puestosDisponibles = puestos;

        // Si hay un puesto seleccionado, lo marcamos en el formulario
        if (puestoIdSeleccionado) {
          this.usuarioForm.patchValue({ puestoTrabajo: puestoIdSeleccionado });
        }
      },
      error: (err) => console.error('❌ Error cargando puestos:', err)
    });
  }



  toggleCamposExtendidos(nombreRol: string): void {
    this.mostrarCamposCliente = nombreRol === 'cliente';
    this.mostrarCamposPeluquero = nombreRol === 'barbero';
  }

  getNombrePuestoSeleccionado(): string {
    const puestoId = this.usuarioForm.get('puestoTrabajo')?.value;
    const puesto = this.puestosDisponibles.find(p => p._id === puestoId);
    return puesto ? puesto.nombre : 'Seleccionar';
  }

  guardar(): void {
    if (this.usuarioForm.invalid) return;

    const formValues = this.usuarioForm.value;
    const datos: any = {
      usuarioId: this.usuarioActualId,
      nombre: formValues.nombre,
      correo: formValues.correo,
      rol: formValues.rol,
      estado: formValues.estado,
      detalles: {
        telefono: formValues.telefono,
        direccion: formValues.direccion,
        genero: formValues.genero,
        fecha_nacimiento: formValues.fecha_nacimiento,
        especialidades: formValues.especialidades,
        experiencia: formValues.experiencia,
        sede: formValues.sede,
        puestoTrabajo: formValues.puestoTrabajo
      }
    };

    // Enviamos datos de control para el backend
    if (this.modo === 'editar') {
      datos.puestoTrabajoAnterior = this.puestoTrabajoAnterior;
      datos.estadoAnterior = this.estadoAnterior;
    }

    if (this.modo === 'crear' || (formValues.password && formValues.password.trim() !== '')) {
      datos.password = formValues.password;
    }

    const accion = this.modo === 'crear'
      ? this.usuarioService.crearUsuario(datos)
      : this.usuarioService.actualizarUsuario(this.data.usuarioId, datos);

    accion.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error(`❌ Error al ${this.modo === 'crear' ? 'crear' : 'actualizar'} usuario:`, err)
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
