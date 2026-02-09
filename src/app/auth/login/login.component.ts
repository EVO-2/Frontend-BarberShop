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
    console.log('🟦 [LOGIN][CTOR] Constructor ejecutado');

    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  async ngOnInit() {
    console.log('🟦 [LOGIN][INIT] ngOnInit INICIADO');

    // 🔌 Ping backend
    const urlPing = this.authService.apiUrl.replace('/api/auth', '');
    console.log('🟦 [LOGIN][PING] URL:', urlPing);

    this.http.get(urlPing, { responseType: 'text' }).subscribe({
      next: (res) => console.log('🟩 [LOGIN][PING] OK:', res),
      error: (err) =>
        console.warn('🟥 [LOGIN][PING] ERROR:', err.status, err.statusText)
    });

    // 🔐 Detectar biometría
    try {
      this.biometricAvailable = await this.biometric.isAvailable();
      console.log('🟦 [LOGIN][BIO] Disponible:', this.biometricAvailable);
    } catch (e) {
      console.error('🟥 [LOGIN][BIO] Error al detectar biometría', e);
    }

    // 🔐 Intentar auto-login biométrico
    let token: string | null = null;
    try {
      token = await this.biometric.getToken?.();
      console.log('🟦 [LOGIN][BIO] Token encontrado:', !!token);
    } catch (e) {
      console.error('🟥 [LOGIN][BIO] Error al obtener token', e);
    }

    if (token && this.biometricAvailable) {
      console.log('🟦 [LOGIN][BIO] Intentando autenticación biométrica');

      try {
        const auth = await this.biometric.authenticate();
        console.log('🟦 [LOGIN][BIO] Resultado auth:', auth);

        if (auth) {
          console.log('🟩 [LOGIN][BIO] Auto-login biométrico exitoso');

          // 👉 SOLO guardar token
          localStorage.setItem('token', token);
          console.log('🟦 [LOGIN][BIO] Token guardado en localStorage');

          console.log('🟦 [LOGIN][NAV] Navegando a /dashboard (biometría)');
          this.router.navigate(['/dashboard']);

          console.log('🟦 [LOGIN][INIT] FIN por biometría');
          return; // ⛔ detener flujo
        }
      } catch (e) {
        console.warn('🟨 [LOGIN][BIO] Autenticación cancelada o falló', e);
      }
    }

    console.log('🟦 [LOGIN][INIT] Login manual disponible');
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
    console.log('🟦 [LOGIN][UI] Toggle password:', this.hidePassword);
  }

  onSubmit(): void {
    console.log('🟦 [LOGIN][SUBMIT] Click en ingresar');

    if (this.form.invalid) {
      console.warn('🟨 [LOGIN][SUBMIT] Formulario inválido', this.form.value);
      return;
    }

    const { correo, password } = this.form.value;
    console.log('🟦 [LOGIN][SUBMIT] Datos enviados:', correo);

    this.authService.login({ correo, password }).subscribe({
      next: async (res) => {
        console.log('🟩 [LOGIN][API] Login OK, respuesta recibida');

        this.authService.guardarDatos(res.token, res.usuario);
        console.log('🟦 [LOGIN][AUTH] Token y usuario guardados');

        if (this.biometricAvailable && this.biometric.saveToken) {
          await this.biometric.saveToken(res.token);
          console.log('🟦 [LOGIN][BIO] Token guardado para biometría');
        }

        console.log('🟦 [LOGIN][NAV] Navegando a /dashboard (manual)');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('🟥 [LOGIN][API] Error login:', err);

        if (err.status === 0) {
          this.errorLogin =
            'No hay conexión con el servidor. Verifica red y backend.';
          alert(this.errorLogin + ' ' + this.authService.apiUrl);
        } else {
          this.errorLogin = err.error?.mensaje || 'Credenciales inválidas';
        }
      }
    });
  }

  async loginWithBiometrics() {
    console.log('🟦 [LOGIN][BIO-BTN] Click login biométrico');

    const available = await this.biometric.isAvailable();
    console.log('🟦 [LOGIN][BIO-BTN] Disponible:', available);

    if (!available) {
      console.warn('🟨 [LOGIN][BIO-BTN] Biometría no disponible');
      return;
    }

    try {
      const auth = await this.biometric.authenticate();
      console.log('🟦 [LOGIN][BIO-BTN] Resultado auth:', auth);

      if (auth) {
        console.log('🟩 [LOGIN][BIO-BTN] Acceso concedido');

        const token = await this.biometric.getToken?.();
        console.log('🟦 [LOGIN][BIO-BTN] Token existe:', !!token);

        if (token) {
          this.authService.guardarDatos(token, null);
          console.log('🟦 [LOGIN][AUTH] Token restaurado');
        }

        console.log('🟦 [LOGIN][NAV] Navegando a /dashboard (botón biometría)');
        this.router.navigate(['/dashboard']);
      }
    } catch (e) {
      console.warn('🟨 [LOGIN][BIO-BTN] Autenticación cancelada', e);
    }
  }
}
