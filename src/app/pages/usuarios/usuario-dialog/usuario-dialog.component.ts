import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { RolService } from 'src/app/core/services/rol.service';
import { SedeService } from 'src/app/core/services/sede.service';
import { PuestoService } from 'src/app/core/services/puesto.service';

@Component({
  selector: 'app-usuario-dialog',
  templateUrl: './usuario-dialog.component.html',
  styleUrls: ['./usuario-dialog.component.scss']
})
export class UsuarioDialogComponent implements OnInit {
  usuarioForm!: FormGroup;
  titulo: string = 'Crear Usuario';
  roles: any[] = [];
  sedes: any[] = [];
  puestos: any[] = [];
  isSubmitting = false;
  rolSeleccionado: string = '';
  hidePassword = true;

togglePassword(): void {
  this.hidePassword = !this.hidePassword;
}


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private sedeService: SedeService,
    private puestoService: PuestoService,
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


    // Suscripción al cambio de rol
    this.usuarioForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.rolSeleccionado = rol;
      this.agregarCamposPorRol(rol);
      this.onRolChange(rol);
    });

    if (this.data?.modo === 'editar') {
      this.titulo = 'Editar Usuario';
      this.rolSeleccionado = this.data?.rol || '';
      this.agregarCamposPorRol(this.rolSeleccionado);

      if (this.rolSeleccionado === 'barbero') {
        this.cargarPuestos();
      }

      this.usuarioForm.patchValue({
        nombre: this.data.nombre,
        correo: this.data.correo,
        rol: this.data.rol,
        estado: this.data.estado,
        puesto_id: this.data?.puesto_id || ''
      });
    }
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
    console.log('Cargar puestos para sedeId:', sedeId); // 👈
    this.puestoService.getPuestos(sedeId).subscribe({
      next: (res) => {
        console.log('Puestos cargados:', res);
        this.puestos = res;
      },
      error: (err) => console.error('Error cargando puestos:', err)
    });
  }



  inicializarFormulario(): void {
  this.usuarioForm = this.fb.group({
    nombre: [this.data?.nombre || '', Validators.required],
    correo: [this.data?.correo || '', [Validators.required, Validators.email]],
    rol: [this.data?.rol || '', Validators.required],
    estado: [this.data?.estado ?? true, Validators.required],
    password: ['', this.data?.modo !== 'editar' ? [Validators.required, Validators.minLength(6)] : []],
    puesto_id: [''],
    direccion: [''],
    sede: [''],
    telefono: [''],
    genero: [''],
    fecha_nacimiento: [''],
    especialidad: [''],
    experiencia: [''],
    telefono_profesional: [''],
    direccion_profesional: [''],
    fechanacimiento: ['']
  });
}


  onRolChange(rol: string): void {
    if (rol === 'barbero' || rol === 'peluquero') {
      const sedeId = this.usuarioForm.get('sede')?.value;
      if (sedeId) {
        this.cargarPuestos(sedeId);
      }
      this.usuarioForm.get('puesto_id')?.setValidators([Validators.required]);
    } else {
      this.usuarioForm.get('puesto_id')?.reset();
      this.usuarioForm.get('puesto_id')?.clearValidators();
    }
    this.usuarioForm.get('puesto_id')?.updateValueAndValidity();
  }


  agregarCamposPorRol(rol: string): void {
  const camposAEliminar = [
    'telefono', 'direccion', 'genero', 'fecha_nacimiento',
    'especialidad', 'experiencia', 'telefono_profesional',
    'direccion_profesional', 'fechanacimiento', 'sede'
  ];

  // Elimina todos los campos dinámicos si existen
  camposAEliminar.forEach(campo => {
    if (this.usuarioForm.contains(campo)) {
      this.usuarioForm.removeControl(campo);
    }
  });

  // Campos obligatorios para el rol cliente
  if (rol === 'cliente') {
    this.usuarioForm.addControl('telefono', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('direccion', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('genero', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('fecha_nacimiento', this.fb.control('', Validators.required));
  }

  // Campos obligatorios para peluquero o barbero
  if (rol === 'peluquero' || rol === 'barbero') {
    this.usuarioForm.addControl('especialidad', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('experiencia', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('telefono_profesional', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('direccion_profesional', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('genero', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('fechanacimiento', this.fb.control('', Validators.required));
    this.usuarioForm.addControl('sede', this.fb.control('', Validators.required));
  }
}


  guardar(): void {
    if (this.usuarioForm.invalid) return;

    const usuarioData = this.usuarioForm.value;
    this.isSubmitting = true;

    const request$ = this.data?.modo === 'editar'
      ? this.usuarioService.actualizarUsuario(this.data.usuario._id, usuarioData)
      : this.usuarioService.crearUsuario(usuarioData);

    console.log('Datos a enviar:', usuarioData);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.error('Error al guardar usuario', err);
        this.isSubmitting = false;
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
