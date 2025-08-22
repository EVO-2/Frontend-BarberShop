import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailExisteValidator } from 'src/app/shared/validators/email-existe.validator';
import { passwordsIguales, telefonoValido } from 'src/app/shared/validators/validators';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registroForm: FormGroup;
  hidePassword = true;
  hideConfirm = true;
  error: string = '';
  cargando = false;

  generos = ['Masculino', 'Femenino', 'Otro'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
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
      fecha_nacimiento: ['', Validators.required]
    }, {
      validators: passwordsIguales('password', 'confirmarPassword')
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
      fecha_nacimiento
    } = this.registroForm.value;

    const nuevoUsuario  = {
  nombre,
  correo,
  password,
  rol: 'cliente',
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
        this.router.navigate(['/login']);
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
    this.router.navigate(['/login']);
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

  get noCoinciden() {
    return this.registroForm.errors?.['noCoinciden'] && this.confirmarPassword?.touched;
  }
}
