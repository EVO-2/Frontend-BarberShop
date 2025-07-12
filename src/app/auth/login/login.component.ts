import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error: string = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.loginForm.invalid) return;

    const { correo, password } = this.loginForm.value;

    this.authService.login({ correo, password }).subscribe({
      next: (res: any) => {
        this.authService.guardarToken(res.token);

        // ✅ Guardar fecha de expiración del token si el backend la envía
        if (res.expiraEn) {
          const expiraEn = new Date(res.expiraEn);
          localStorage.setItem('expiraEn', expiraEn.toISOString());
          console.log('🕒 Token expira en:', expiraEn.toLocaleString());
        }

        const rol = this.authService.obtenerRol();
        console.log('🔑 Rol detectado:', rol);

        if (rol === 'admin') {
          this.router.navigate(['/usuarios']);
        } else if (rol === 'cliente') {
          this.router.navigate(['/reservar']);
        } else if (rol === 'barbero') {
          this.router.navigate(['/mis-citas']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err: any) => {
        console.error('❌ Error al iniciar sesión:', err);
        this.error = err.error?.mensaje || 'Correo o contraseña incorrectos';
      }
    });
  }
}
