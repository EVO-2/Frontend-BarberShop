import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError = false;
  isLoading = false;
  hidePassword = true;
  mostrarPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.loginError = false;

    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const loginData = this.loginForm.value;

    this.http.post<any>('http://localhost:3000/api/auth/login', loginData).subscribe({
      next: (res) => {
        console.log('✅ Respuesta:', res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        const rol = res.user.rol;
        switch (rol) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          case 'barbero':
            this.router.navigate(['/barbero']);
            break;
          case 'cliente':
            this.router.navigate(['/cliente']);
            break;
          default:
            this.router.navigate(['/dashboard']);
            break;
        }
      },
      error: (err) => {
        console.error('❌ Error en login', err);
        this.loginError = true;
        this.isLoading = false;
      }
    });
  }
}
