import { Component, OnInit } from '@angular/core';
import { ComisionesService } from 'src/app/core/services/comisiones.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-comisiones',
  templateUrl: './comisiones.component.html',
  styleUrls: ['./comisiones.component.scss']
})
export class ComisionesComponent implements OnInit {
  rol: string = '';
  comisionesPendientes: any[] = [];
  historialPagos: any[] = [];

  miComisionAcumulada: number = 0;
  misCitasPendientes: any[] = [];

  cargando: boolean = true;

  constructor(
    private comisionesService: ComisionesService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe(u => {
      if (u) {
        this.rol = typeof u.rol === 'string' ? u.rol : u.rol.nombre;
        if (this.rol === 'admin') {
          this.cargarDatosAdmin();
        } else if (this.rol === 'barbero' || this.rol === 'manicurista') {
          this.cargarDatosProfesional();
        }
      }
    });
  }

  cargarDatosAdmin() {
    this.cargando = true;
    this.comisionesService.getComisionesPendientes().subscribe({
      next: (res) => {
        this.comisionesPendientes = res.data;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });

    this.comisionesService.getHistorialPagos().subscribe({
      next: (res) => {
        this.historialPagos = res.data;
      }
    });
  }

  cargarDatosProfesional() {
    this.cargando = true;
    this.comisionesService.getMiComision().subscribe({
      next: (res) => {
        this.miComisionAcumulada = res.data.montoAcumulado;
        this.misCitasPendientes = res.data.citas;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });

    this.comisionesService.getMiHistorialPagos().subscribe({
      next: (res) => {
        this.historialPagos = res.data;
      }
    });
  }

  pagarComision(peluqueroId: string) {
    if (confirm('¿Estás seguro de pagar las comisiones pendientes a este profesional?')) {
      this.comisionesService.pagarComisiones(peluqueroId, 'efectivo').subscribe({
        next: (res) => {
          this.toastr.success(res.mensaje);
          this.cargarDatosAdmin();
        },
        error: (err) => {
          this.toastr.error(err.error.mensaje || 'Error al pagar');
        }
      });
    }
  }
}
