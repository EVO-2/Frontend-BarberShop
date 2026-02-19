import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// ✅ Servicio Biométrico
import { BiometricService } from '../../services/biometric.service';

// ✅ Animaciones Angular
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('cardEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.96)' }),
        animate(
          '450ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        )
      ])
    ])
  ]
})
export class LoginComponent {

  form: FormGroup;
  hidePassword = true;
  errorLogin: string = '';
  biometricAvailable = false;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public router: Router,
    private http: HttpClient,
    private biometric: BiometricService
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  async ngOnInit() {
    // 🔌 Ping backend
    const urlPing = this.authService.apiUrl.replace('/api/auth', '');

    this.http.get(urlPing, { responseType: 'text' }).subscribe({
      next: () => { },
      error: () => { }
    });

    // 🔐 Detectar biometría
    try {
      this.biometricAvailable = await this.biometric.isAvailable();
    } catch (e) {
      // Error silencioso al detectar biometría
    }

    // 🔐 Intentar auto-login biométrico
    let token: string | null = null;
    try {
      token = await this.biometric.getToken?.();
    } catch (e) {
      // Error silencioso al obtener token
    }

    if (token && this.biometricAvailable) {
      try {
        const auth = await this.biometric.authenticate();

        if (auth) {
          // 👉 SOLO guardar token
          localStorage.setItem('token', token);
          this.router.navigate(['/dashboard']);
          return; // ⛔ detener flujo
        }
      } catch (e) {
        // Autenticación cancelada o falló
      }
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { correo, password } = this.form.value;

    this.authService.login({ correo, password }).subscribe({
      next: async (res) => {
        this.authService.guardarDatos(res.token, res.usuario);

        if (this.biometricAvailable && this.biometric.saveToken) {
          await this.biometric.saveToken(res.token);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.status === 0) {
          this.errorLogin =
            'No hay conexión con el servidor. Verifica red y backend.';
        } else {
          this.errorLogin = err.error?.mensaje || 'Credenciales inválidas';
        }
      }
    });
  }

  async loginWithBiometrics() {
    const available = await this.biometric.isAvailable();

    if (!available) {
      return;
    }

    try {
      const auth = await this.biometric.authenticate();

      if (auth) {
        const token = await this.biometric.getToken?.();

        if (token) {
          this.authService.guardarDatos(token, null);
        }

        this.router.navigate(['/dashboard']);
      }
    } catch (e) {
      // Autenticación cancelada
    }
  }
}
