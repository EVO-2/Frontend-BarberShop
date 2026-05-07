import {
  AfterViewInit,
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
export class OnboardingComponent implements OnInit, AfterViewInit {

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


  /* =========================================================
     INIT
  ========================================================= */
  ngOnInit(): void { }


  /* =========================================================
     AFTER VIEW INIT
  ========================================================= */
  ngAfterViewInit(): void {

    setTimeout(() => {

      console.clear();

      console.log('======================================');
      console.log('🚨 ONBOARDING SCROLL DEBUG');
      console.log('======================================');


      /* =====================================================
         FORCE GLOBAL SCROLL FIX
      ===================================================== */

      console.log('🛠 Aplicando scroll runtime fix...');

      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
      document.body.style.position = 'relative';
      document.body.style.height = 'auto';
      document.body.style.minHeight = '100%';

      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = '100%';


      /* =====================================================
         REMOVE ANGULAR MATERIAL SCROLL BLOCK
      ===================================================== */

      document.body.classList.remove('cdk-global-scrollblock');

      console.log('✅ BODY SCROLL FIX APPLIED');


      /* =====================================================
         FORCE IONIC FIX
      ===================================================== */

      const ionApp =
        document.querySelector('ion-app') as HTMLElement;

      if (ionApp) {

        ionApp.style.overflow = 'visible';
        ionApp.style.height = 'auto';
        ionApp.style.minHeight = '100vh';

        console.log('✅ ION-APP FIX APPLIED');
      }


      const ionContent =
        document.querySelector('ion-content') as HTMLElement;

      if (ionContent) {

        ionContent.style.setProperty('--overflow', 'auto');

        ionContent.style.overflow = 'auto';
        ionContent.style.height = 'auto';
        ionContent.style.maxHeight = 'unset';

        console.log('✅ ION-CONTENT FIX APPLIED');
      }


      /* =====================================================
         FORCE WINDOW SCROLL
      ===================================================== */

      window.scrollTo(0, 0);

      console.log('✅ WINDOW SCROLL RESET');


      /* =====================================================
         DEBUG GLOBAL
      ===================================================== */

      console.log('--------------------------------------');
      console.log('🌍 GLOBAL');
      console.log('--------------------------------------');

      console.log(
        '📌 window.innerHeight =>',
        window.innerHeight
      );

      console.log(
        '📌 document.body.scrollHeight =>',
        document.body.scrollHeight
      );

      console.log(
        '📌 document.documentElement.scrollHeight =>',
        document.documentElement.scrollHeight
      );

      console.log(
        '📌 body overflow =>',
        getComputedStyle(document.body).overflow
      );

      console.log(
        '📌 body overflowY =>',
        getComputedStyle(document.body).overflowY
      );

      console.log(
        '📌 html overflow =>',
        getComputedStyle(document.documentElement).overflow
      );

      console.log(
        '📌 html overflowY =>',
        getComputedStyle(document.documentElement).overflowY
      );


      /* =====================================================
         ONBOARDING CONTAINER
      ===================================================== */

      const onboarding =
        document.querySelector('.onboarding-container') as HTMLElement;

      if (onboarding) {

        onboarding.style.overflowY = 'auto';
        onboarding.style.overflowX = 'hidden';
        onboarding.style.height = 'auto';
        onboarding.style.minHeight = '100vh';

        console.log('--------------------------------------');
        console.log('📦 ONBOARDING CONTAINER');
        console.log('--------------------------------------');

        console.log(
          'scrollHeight =>',
          onboarding.scrollHeight
        );

        console.log(
          'clientHeight =>',
          onboarding.clientHeight
        );

        console.log(
          'offsetHeight =>',
          onboarding.offsetHeight
        );

        console.log(
          'overflow =>',
          getComputedStyle(onboarding).overflow
        );

        console.log(
          'overflowY =>',
          getComputedStyle(onboarding).overflowY
        );

        console.log(
          'position =>',
          getComputedStyle(onboarding).position
        );

        console.log(
          'display =>',
          getComputedStyle(onboarding).display
        );
      }


      /* =====================================================
         GLASS CARD
      ===================================================== */

      const glass =
        document.querySelector('.glass-card') as HTMLElement;

      if (glass) {

        console.log('--------------------------------------');
        console.log('🟨 GLASS CARD');
        console.log('--------------------------------------');

        console.log(
          'scrollHeight =>',
          glass.scrollHeight
        );

        console.log(
          'clientHeight =>',
          glass.clientHeight
        );

        console.log(
          'offsetHeight =>',
          glass.offsetHeight
        );

        console.log(
          'overflow =>',
          getComputedStyle(glass).overflow
        );

        console.log(
          'position =>',
          getComputedStyle(glass).position
        );
      }


      /* =====================================================
         APP ROOT
      ===================================================== */

      const appRoot =
        document.querySelector('app-root') as HTMLElement;

      if (appRoot) {

        appRoot.style.overflow = 'visible';
        appRoot.style.minHeight = '100vh';

        console.log('--------------------------------------');
        console.log('🧱 APP ROOT');
        console.log('--------------------------------------');

        console.log(
          'height =>',
          getComputedStyle(appRoot).height
        );

        console.log(
          'overflow =>',
          getComputedStyle(appRoot).overflow
        );

        console.log(
          'overflowY =>',
          getComputedStyle(appRoot).overflowY
        );

        console.log(
          'position =>',
          getComputedStyle(appRoot).position
        );
      }


      console.log('======================================');
      console.log('✅ FIN DEBUG');
      console.log('======================================');

    }, 500);
  }


  /* =========================================================
     REGISTRO SAAS
  ========================================================= */
  registrarSaaS(): void {

    if (this.onboardingForm.invalid) {

      console.warn('⚠️ Formulario inválido');

      this.onboardingForm.markAllAsTouched();

      return;
    }

    this.isLoading = true;

    const formData = this.onboardingForm.value;

    console.log('📤 Datos enviados:', formData);


    this.authService.registroSaaS(formData).subscribe({

      next: (resp) => {

        console.log('✅ Registro exitoso:', resp);

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

            console.log('======================================');
            console.log('✅ AUTO LOGIN EXITOSO');
            console.log('======================================');

            console.log(
              '📥 LOGIN RESPONSE FRONT:',
              loginResp
            );

            console.log(
              '📌 TOKEN EN LOCALSTORAGE:',
              localStorage.getItem('token')
            );

            console.log(
              '📌 USUARIO EN LOCALSTORAGE:',
              localStorage.getItem('usuario')
            );

            console.log(
              '📌 URL ACTUAL ANTES NAVIGATION:',
              this.router.url
            );

            console.log(
              '🚀 Intentando navegar a /dashboard'
            );


            /* =====================================
               NAVIGATION DEBUG
            ===================================== */

            this.router.navigate(['/dashboard'])

              .then((success) => {

                console.log('======================================');
                console.log('📌 RESULTADO navigate()');
                console.log('======================================');

                console.log(
                  'success =>',
                  success
                );

                console.log(
                  '📌 URL DESPUÉS navigate:',
                  this.router.url
                );

                setTimeout(() => {

                  console.log(
                    '📌 URL 1 SEGUNDO DESPUÉS:',
                    window.location.href
                  );

                }, 1000);
              })

              .catch((navErr) => {

                console.error(
                  '❌ ERROR EN navigate:',
                  navErr
                );
              });
          },

          error: (loginErr) => {

            console.error(
              '❌ Error auto login:',
              loginErr
            );

            this.router.navigate(['/login']);
          }
        });
      },

      error: (err) => {

        console.error('❌ Error registro:', err);

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