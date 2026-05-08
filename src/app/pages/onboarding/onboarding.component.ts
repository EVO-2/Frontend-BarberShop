import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

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
        password: ['', [
          Validators.required, 
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        ]]
      }),

      terminos: [false, Validators.requiredTrue]
    });
  }


  /* =========================================================
     INIT
  ========================================================= */
  ngOnInit(): void { }





  /* =========================================================
     REGISTRO SAAS
  ========================================================= */
  registrarSaaS(): void {

    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.onboardingForm.value;

    this.authService.registroSaaS(formData).subscribe({

      next: (resp) => {
        this.isLoading = false;
        this.toastr.success(
          '¡Tu barbería ha sido creada exitosamente! 🎉',
          'Bienvenido'
        );

        /* =====================================================
           AUTO LOGIN
        ===================================================== */

        this.authService.login({
          correo: formData.usuario.correo,
          password: formData.usuario.password
        }).subscribe({

          next: (loginResp) => {
            this.router.navigate(['/dashboard'])
              .catch((navErr) => {
                console.error('Error al navegar:', navErr);
              });
          },

          error: (loginErr) => {
            this.router.navigate(['/login']);
          }
        });
      },

      error: (err) => {
        this.isLoading = false;
        const msg =
          err.error?.msg ||
          'Ocurrió un error inesperado al registrar tu barbería.';

        this.toastr.error(
          msg,
          'Error de Registro'
        );
      }
    });
  }
}