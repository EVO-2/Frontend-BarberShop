import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  onboardingForm: FormGroup;
  isLoading: boolean = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.onboardingForm = this.fb.group({
      empresa: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        telefono: ['', Validators.required],
        direccion: ['', Validators.required]
      }),
      usuario: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        correo: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }),
      terminos: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {}

  registrarSaaS() {
    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.onboardingForm.value;

    this.authService.registroSaaS(formData).subscribe({
      next: (resp) => {
        this.isLoading = false;
        this.toastr.success('¡Tu barbería ha sido creada exitosamente! 🎉', 'Bienvenido');
        
        // Hacemos auto-login con los datos recién creados
        this.authService.login({
          correo: formData.usuario.correo,
          password: formData.usuario.password
        }).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.msg || 'Ocurrió un error inesperado al registrar tu barbería.';
        this.toastr.error(msg, 'Error de Registro');
      }
    });
  }
}
