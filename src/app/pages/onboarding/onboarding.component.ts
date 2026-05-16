import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors
} from '@angular/forms';

import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  onboardingForm: FormGroup;
  isLoading: boolean = false;
  logoFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {

    this.onboardingForm = this.fb.group({

      empresa: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)], [this.validarEmpresaUnica()]],
        telefono: ['', Validators.required],
        direccion: ['', Validators.required]
      }),

      usuario: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        correo: ['', [Validators.required, Validators.email], [this.validarCorreoUnico()]],
        password: ['', [
          Validators.required, 
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        ]]
      }),

      terminos: [false, Validators.requiredTrue]
    });
  }

  validarEmpresaUnica(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      // debounce de 500ms
      return timer(500).pipe(
        switchMap(() => this.authService.verificarEmpresa(control.value)),
        map(res => (res.disponible ? null : { empresaDuplicada: true })),
        catchError(() => of(null))
      );
    };
  }

  validarCorreoUnico(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      return timer(500).pipe(
        switchMap(() => this.authService.verificarCorreoOnboarding(control.value)),
        map(res => (res.disponible ? null : { correoDuplicado: true })),
        catchError(() => of(null))
      );
    };
  }

  ngOnInit(): void { }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/*/) || file.size > 2 * 1024 * 1024) {
        this.toastr.error('Solo se permiten imágenes (JPG, PNG) menores a 2MB.', 'Archivo inválido');
        return;
      }
      this.logoFile = file;

      const reader = new FileReader();
      reader.onload = (e) => this.logoPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  registrarSaaS(): void {

    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValues = this.onboardingForm.value;

    const formData = new FormData();
    formData.append('empresa', JSON.stringify(formValues.empresa));
    formData.append('usuario', JSON.stringify(formValues.usuario));
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }

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
          correo: formValues.usuario.correo,
          password: formValues.usuario.password
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

  openTermsDialog(event: Event): void {
    event.preventDefault();
    Swal.fire({
      title: 'Términos y Política de Privacidad',
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.5; color: #444;">
          <h4 style="margin-top: 0; color: #222;">Tratamiento de Datos Personales (Ley 1581 de 2012 - Habeas Data)</h4>
          <p>Al aceptar estos términos, usted autoriza de manera voluntaria, previa, explícita, informada e inequívoca a <strong>BarberSaaS</strong> para tratar sus datos personales de acuerdo con la Ley 1581 de 2012 y sus decretos reglamentarios.</p>
          
          <h5 style="color: #222; margin-bottom: 0.5rem;">Finalidad del Tratamiento:</h5>
          <ul style="margin-top: 0;">
            <li>Registro y administración de su cuenta en la plataforma.</li>
            <li>Gestión de citas y notificaciones de los servicios.</li>
            <li>Envío de información comercial, publicitaria y promocional.</li>
            <li>Fines estadísticos y mejora continua del servicio.</li>
          </ul>
          
          <h5 style="color: #222; margin-bottom: 0.5rem;">Derechos del Titular:</h5>
          <p style="margin-top: 0;">Como titular de sus datos personales, usted tiene derecho a conocer, actualizar, rectificar y suprimir su información, así como a revocar la autorización otorgada, conforme a la ley aplicable.</p>
          
          <p style="margin-bottom: 0;">Nos comprometemos a proteger su privacidad y mantener estricta confidencialidad de su información mediante medidas de seguridad adecuadas.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#e6b17e',
      width: '600px'
    });
  }
}