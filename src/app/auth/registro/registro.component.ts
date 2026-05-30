import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailExisteValidator } from 'src/app/shared/validators/email-existe.validator';
import { passwordsIguales, telefonoValido } from 'src/app/shared/validators/validators';
import { MatDialog } from '@angular/material/dialog';
import { TerminosDialogComponent } from 'src/app/shared/components/terminos-dialog/terminos-dialog.component';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  hidePassword = true;
  hideConfirm = true;
  error: string = '';
  cargando = false;

  generos = ['Masculino', 'Femenino', 'Otro'];
  empresas: any[] = [];
  empresaIdPreset: string | null = null;
  empresaPreset = false;
  nombreEmpresaPreset = '';
  logoEmpresaPreset = 'assets/sede.png';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      correo: ['', [
        Validators.required,
        Validators.email
      ], [emailExisteValidator(this.authService)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      ]],
      confirmarPassword: ['', Validators.required],
      telefono: ['', [Validators.required, telefonoValido()]],
      direccion: ['', Validators.required],
      genero: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      empresaId: ['', Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, {
      validators: passwordsIguales('password', 'confirmarPassword')
    });
  }

  ngOnInit(): void {
    // 🔍 Detectar empresaId de los parámetros de consulta
    this.route.queryParams.subscribe(params => {
      const empId = params['empresaId'] || params['empresa'];
      if (empId) {
        this.empresaIdPreset = empId;
        this.empresaPreset = true;
        this.registroForm.get('empresaId')?.setValue(empId);
        this.registroForm.get('empresaId')?.clearValidators();
        this.registroForm.get('empresaId')?.updateValueAndValidity();
      }
    });

    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.authService.obtenerEmpresasPublicas().subscribe({
      next: (res: any) => {
        this.empresas = res.empresas || [];
        if (this.empresaIdPreset) {
          const emp = this.empresas.find(e => e._id === this.empresaIdPreset);
          if (emp) {
            this.nombreEmpresaPreset = emp.nombre;
            this.logoEmpresaPreset = emp.logo || 'assets/sede.png';
          }
        }
      },
      error: (err) => {
        console.error('Error cargando empresas:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) return;

    this.cargando = true;
    const {
      nombre,
      correo,
      password,
      telefono,
      direccion,
      genero,
      fecha_nacimiento,
      empresaId
    } = this.registroForm.value;

    const nuevoUsuario  = {
      nombre,
      correo,
      password,
      rol: 'cliente',
      empresaId: this.empresaIdPreset || empresaId,
      cliente: {
        telefono,
        direccion,
        genero,
        fecha_nacimiento
      }
    };

    this.authService.registro(nuevoUsuario).subscribe({
      next: () => {
        this.cargando = false;
        this.snackBar.open('Registro exitoso. ¡Bienvenido!', 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-success']
        });
        // Redirigir al login preservando el contexto de la empresa
        this.router.navigate(['/login'], { queryParamsHandling: 'merge' });
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al registrar usuario';
        this.cargando = false;
        this.snackBar.open(this.error, 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  volverAlLogin(): void {
    this.router.navigate(['/login'], { queryParamsHandling: 'merge' });
  }

  abrirModalTerminos(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.dialog.open(TerminosDialogComponent, {
      width: '500px',
      autoFocus: false
    });
  }

  // Getters para el template
  get nombre() { return this.registroForm.get('nombre'); }
  get correo() { return this.registroForm.get('correo'); }
  get password() { return this.registroForm.get('password'); }
  get confirmarPassword() { return this.registroForm.get('confirmarPassword'); }
  get telefono() { return this.registroForm.get('telefono'); }
  get direccion() { return this.registroForm.get('direccion'); }
  get genero() { return this.registroForm.get('genero'); }
  get fecha_nacimiento() { return this.registroForm.get('fecha_nacimiento'); }
  get empresaIdField() { return this.registroForm.get('empresaId'); }
  get terminos() { return this.registroForm.get('terminos'); }

  get noCoinciden() {
    return this.registroForm.errors?.['noCoinciden'] && this.confirmarPassword?.touched;
  }
}
