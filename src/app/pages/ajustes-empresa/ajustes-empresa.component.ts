import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EmpresaService, EmpresaInfo, HorarioDia } from '../../core/services/empresa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ajustes-empresa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './ajustes-empresa.component.html',
  styleUrls: ['./ajustes-empresa.component.scss'],
})
export class AjustesEmpresaComponent implements OnInit {

  form: FormGroup;
  loading = true;
  saving = false;

  // Lista de horas predefinidas para el selector
  horas: string[] = [];

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService
  ) {
    this.generarHoras();
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      nit: [''],
      direccion: [''],
      telefono: [''],
      email: ['', [Validators.email]],
      logo: [''],
      agendamientoAbierto: [true],
      mensajeCierre: ['El agendamiento de citas se encuentra temporalmente cerrado.'],
      horarios: this.fb.array([]),
      configuracionComisiones: this.fb.group({
        herramientas_empresa: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
        herramientas_propias: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
        propietario: [100, [Validators.required, Validators.min(0), Validators.max(100)]]
      }),
      whatsappConfig: this.fb.group({
        habilitado: [true],
        phoneNumberId: [''],
        displayPhoneNumber: [''],
        tokenAcceso: [''],
        instruccionesIA: ['Atendemos con y sin cita previa. Ofrecemos bebidas de cortesía y excelente atención.']
      })
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  generarHoras() {
    // Genera horas de 05:00 a 23:30 en intervalos de 30 minutos
    for (let h = 5; h < 24; h++) {
      const horaStr = h < 10 ? `0${h}` : `${h}`;
      this.horas.push(`${horaStr}:00`);
      this.horas.push(`${horaStr}:30`);
    }
  }

  get horariosArray(): FormArray {
    return this.form.get('horarios') as FormArray;
  }

  cargarDatos() {
    this.loading = true;
    this.empresaService.obtenerInfoEmpresa().subscribe({
      next: (res) => {
        const empresa = res.empresa;
        this.form.patchValue({
          nombre: empresa.nombre,
          nit: empresa.nit || '',
          direccion: empresa.direccion || '',
          telefono: empresa.telefono || '',
          email: empresa.email || '',
          logo: empresa.logo || 'assets/sede.png',
          agendamientoAbierto: empresa.agendamientoAbierto !== undefined ? empresa.agendamientoAbierto : true,
          mensajeCierre: empresa.mensajeCierre || 'El agendamiento de citas se encuentra temporalmente cerrado.',
          configuracionComisiones: {
            herramientas_empresa: (empresa.configuracionComisiones?.herramientas_empresa || 0.50) * 100,
            herramientas_propias: (empresa.configuracionComisiones?.herramientas_propias || 0.60) * 100,
            propietario: (empresa.configuracionComisiones?.propietario || 1.00) * 100
          },
          whatsappConfig: {
            habilitado: empresa.whatsappConfig?.habilitado !== undefined ? empresa.whatsappConfig.habilitado : true,
            phoneNumberId: empresa.whatsappConfig?.phoneNumberId || '',
            displayPhoneNumber: empresa.whatsappConfig?.displayPhoneNumber || '',
            tokenAcceso: empresa.whatsappConfig?.tokenAcceso || '',
            instruccionesIA: empresa.whatsappConfig?.instruccionesIA || 'Atendemos con y sin cita previa. Ofrecemos bebidas de cortesía y excelente atención.'
          }
        });

        // Poblar horarios
        this.horariosArray.clear();
        if (empresa.horarios && empresa.horarios.length > 0) {
          // Ordenar los horarios para mostrarlos de Lunes a Domingo
          const ordenDias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
          const horariosOrdenados = [...empresa.horarios].sort((a, b) => ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia));

          horariosOrdenados.forEach((h: HorarioDia) => {
            this.horariosArray.push(this.fb.group({
              _id: [h._id],
              dia: [h.dia],
              abierto: [h.abierto],
              apertura: [h.apertura || '08:00'],
              cierre: [h.cierre || '20:00']
            }));
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar la información de la empresa', 'error');
        this.loading = false;
      }
    });
  }

  capitalizar(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  probandoWhatsApp = false;
  probarWhatsApp() {
    Swal.fire({
      title: 'Probar Bot de WhatsApp',
      text: 'Ingresa el número con indicativo internacional (ej: 573001234567) al que enviaremos el mensaje de bienvenida:',
      input: 'text',
      inputPlaceholder: '573001234567',
      showCancelButton: true,
      confirmButtonText: 'Enviar Prueba',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#25D366',
      showLoaderOnConfirm: true,
      preConfirm: (numero) => {
        if (!numero || numero.trim().length < 8) {
          Swal.showValidationMessage('Ingresa un número de teléfono válido.');
          return false;
        }
        return numero.trim();
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.probandoWhatsApp = true;
        this.empresaService.probarWhatsApp(result.value).subscribe({
          next: (res) => {
            this.probandoWhatsApp = false;
            Swal.fire({
              title: '¡Mensaje Enviado!',
              text: res.msg || 'La prueba de conexión con WhatsApp se ejecutó correctamente.',
              icon: 'success',
              confirmButtonColor: '#25D366'
            });
          },
          error: (err) => {
            this.probandoWhatsApp = false;
            Swal.fire({
              title: 'Error de Envío',
              text: err?.error?.msg || 'No se pudo enviar el mensaje. Verifica que las credenciales de WhatsApp estén configuradas en el backend.',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        });
      }
    });
  }

  guardarCambios() {
    if (this.form.invalid) {
      Swal.fire('Atención', 'Por favor completa los campos obligatorios.', 'warning');
      return;
    }

    this.saving = true;
    const formValue = this.form.value;
    
    // Transformar los porcentajes de vuelta a decimales
    const datosActualizar: EmpresaInfo = {
      ...formValue,
      configuracionComisiones: {
        herramientas_empresa: (formValue.configuracionComisiones?.herramientas_empresa || 0) / 100,
        herramientas_propias: (formValue.configuracionComisiones?.herramientas_propias || 0) / 100,
        propietario: (formValue.configuracionComisiones?.propietario || 0) / 100
      }
    };

    this.empresaService.actualizarInfoEmpresa(datosActualizar).subscribe({
      next: (res) => {
        Swal.fire({
          title: '¡Guardado!',
          text: res.msg || 'Ajustes actualizados correctamente',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
        
        // Actualizar datos locales en el localStorage para que los headers/footers se refresquen
        const usrStr = localStorage.getItem('usuario');
        if (usrStr) {
          const usuario = JSON.parse(usrStr);
          usuario.empresaNombre = res.empresa.nombre;
          usuario.empresaLogo = res.empresa.logo;
          
          if (usuario.empresaId && typeof usuario.empresaId === 'object') {
            usuario.empresaId = {
              ...usuario.empresaId,
              ...res.empresa
            };
          } else {
            usuario.empresaId = res.empresa;
          }
          
          localStorage.setItem('usuario', JSON.stringify(usuario));
          
          // Recargar ventana después de un segundo para propagar la actualización al footer global
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        }

        this.saving = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron guardar los ajustes', 'error');
        this.saving = false;
      }
    });
  }
}
