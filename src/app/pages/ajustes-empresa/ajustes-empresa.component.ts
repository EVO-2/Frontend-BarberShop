import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmpresaService, AgendamientoEstado } from '../../core/services/empresa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ajustes-empresa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ajustes-empresa.component.html',
  styleUrls: ['./ajustes-empresa.component.scss'],
})
export class AjustesEmpresaComponent implements OnInit {

  estadoAgendamiento: AgendamientoEstado = {
    agendamientoAbierto: true,
    mensajeCierre: 'El agendamiento de citas se encuentra temporalmente cerrado.'
  };

  loading = true;
  saving = false;

  constructor(private empresaService: EmpresaService) { }

  ngOnInit() {
    this.cargarEstado();
  }

  cargarEstado() {
    this.loading = true;
    this.empresaService.obtenerEstadoAgendamiento().subscribe({
      next: (res) => {
        this.estadoAgendamiento.agendamientoAbierto = res.agendamientoAbierto;
        this.estadoAgendamiento.mensajeCierre = res.mensajeCierre;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el estado del agendamiento', 'error');
        this.loading = false;
      }
    });
  }

  guardarCambios() {
    this.saving = true;
    this.empresaService.cambiarEstadoAgendamiento(this.estadoAgendamiento).subscribe({
      next: (res) => {
        Swal.fire({
          title: '¡Guardado!',
          text: res.msg || 'Ajustes actualizados correctamente',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
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
