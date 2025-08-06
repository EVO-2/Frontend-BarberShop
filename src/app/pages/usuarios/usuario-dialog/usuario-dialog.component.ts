import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { SedeService } from 'src/app/core/services/sede.service';
import { RolService } from 'src/app/core/services/rol.service';
import { PuestoService } from 'src/app/core/services/puesto.service';

import { telefonoValido } from 'src/app/shared/validators/validators';
import { passwordSegura } from 'src/app/shared/validators/password-segura.validator';
import { passwordsIguales } from 'src/app/shared/validators/validators';
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
  ) { }

  ngOnInit(): void {
    console.log('📥 DATA RECIBIDA AL ABRIR DIALOG:', this.data);
    this.cargarRoles();
    this.cargarSedes();

    this.modo = this.data?.modo === 'editar' ? 'editar' : 'crear';
    this.titulo = this.modo === 'editar' ? 'Editar Usuario' : 'Crear Usuario';

    this.inicializarFormulario();

    this.usuarioForm.get('rol')?.valueChanges.subscribe((rolId) => {
      const rolSeleccionado = this.roles.find(r => r._id === rolId);
      const nombreRol = rolSeleccionado?.nombre || '';
      this.toggleCamposExtendidos(nombreRol);
    });

    this.usuarioForm.get('sede')?.valueChanges.subscribe((sedeId) => {
      this.onSedeSeleccionada(sedeId);
    });

    if (this.modo === 'editar') {
      this.cargarUsuarioParaEditar(this.data.usuarioId);
    }
  }

  inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email
      ], [emailExisteValidator(this.authService, this.data?.usuario?.correo)]],
      password: ['', this.modo === 'crear' ? [Validators.required, passwordSegura()] : []],
      confirmarPassword: [''],
      rol: ['', Validators.required],
      estado: [true],
      telefono: ['', telefonoValido()],
      direccion: [''],
      genero: ['otro'],
      fecha_nacimiento: [''],
      especialidades: [[]],
      experiencia: [0],
      sede: [''],
      puestoTrabajo: ['']
    }, {
      validators: passwordsIguales('password', 'confirmarPassword')
    });
  }

  cargarRoles(): void {
    this.rolService.obtenerRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        console.log('📋 Roles cargados:', this.roles);
      },
      error: (err) => console.error('❌ Error cargando roles:', err)
    });
  }

  cargarSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes;
        console.log('📦 Sedes cargadas:', this.sedes);
      },
      error: (err) => console.error('❌ Error cargando sedes:', err)
    });
  }

  cargarUsuarioParaEditar(usuarioId: string): void {
    this.usuarioService.obtenerUsuarioPorId(usuarioId).subscribe({
      next: (usuarioCompleto) => {
        console.log('📥 Usuario cargado desde backend:', usuarioCompleto);

        const detalles = usuarioCompleto.detalles || {};
        const rol = usuarioCompleto.rol?.nombre || usuarioCompleto.rol;

        this.usuarioForm.patchValue({
          nombre: usuarioCompleto.nombre,
          correo: usuarioCompleto.correo,
          rol: usuarioCompleto.rol && typeof usuarioCompleto.rol === 'object' ? usuarioCompleto.rol._id : usuarioCompleto.rol || '',
          estado: usuarioCompleto.estado,
          telefono: detalles.telefono || detalles.telefono_profesional || '',
          direccion: detalles.direccion || detalles.direccion_profesional || '',
          genero: detalles.genero || 'otro',
          fecha_nacimiento: detalles.fecha_nacimiento || '',
          especialidades: detalles.especialidades || [],
          experiencia: detalles.experiencia || 0,
          sede: detalles.sede && typeof detalles.sede === 'object' ? detalles.sede._id : detalles.sede || '',
          puestoTrabajo: detalles.puestoTrabajo && typeof detalles.puestoTrabajo === 'object' ? detalles.puestoTrabajo._id : detalles.puestoTrabajo || ''
        });

        this.toggleCamposExtendidos(rol);

        if (detalles.sede) {
          const sedeId = detalles.sede._id || detalles.sede;
          this.cargarPuestos(sedeId);
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar usuario desde backend:', err);
      }
    });
  }

  cargarPuestos(sedeId: string): void {
    this.puestoService.getPuestos(sedeId).subscribe({
      next: (puestos) => {
        this.puestosDisponibles = puestos;
        console.log('💺 Puestos disponibles cargados:', puestos);
      },
      error: (err) => console.error('❌ Error cargando puestos:', err)
    });
  }

  onSedeSeleccionada(sedeId: string): void {
    if (sedeId) {
      this.cargarPuestos(sedeId);
    } else {
      this.puestosDisponibles = [];
    }
  }

  toggleCamposExtendidos(nombreRol: string): void {
    this.mostrarCamposCliente = nombreRol === 'cliente';
    this.mostrarCamposPeluquero = nombreRol === 'barbero';
    console.log('🟢 mostrarCamposCliente:', this.mostrarCamposCliente);
    console.log('🟢 mostrarCamposPeluquero:', this.mostrarCamposPeluquero);
  }

  guardar(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const datos = this.usuarioForm.value;
    console.log('📤 Datos a enviar:', datos);

    if (this.modo === 'crear') {
      this.usuarioService.crearUsuario(datos).subscribe({
        next: (res) => {
          console.log('✅ Usuario creado:', res);
          this.dialogRef.close(true);
        },
        error: (err) => console.error('❌ Error al crear usuario:', err)
      });
    } else {
      this.usuarioService.actualizarUsuario(this.data.usuarioId, datos).subscribe({
        next: (res) => {
          console.log('✅ Usuario actualizado:', res);
          this.dialogRef.close(true);
        },
        error: (err) => console.error('❌ Error al actualizar usuario:', err)
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }

}
