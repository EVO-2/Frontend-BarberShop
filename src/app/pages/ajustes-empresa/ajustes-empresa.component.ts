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
      horarios: this.fb.array([])
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
          mensajeCierre: empresa.mensajeCierre || 'El agendamiento de citas se encuentra temporalmente cerrado.'
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

  guardarCambios() {
    if (this.form.invalid) {
      Swal.fire('Atención', 'Por favor completa los campos obligatorios.', 'warning');
      return;
    }

    this.saving = true;
    const datosActualizar: EmpresaInfo = this.form.value;

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
