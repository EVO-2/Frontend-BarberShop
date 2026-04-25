import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { SedeService } from 'src/app/core/services/sede.service';

import {
  DashboardService,
  DashboardResumen
} from '../../core/services/dashboard.service';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export class DashboardComponent implements OnInit {

  resumen: DashboardResumen | null = null;

  loading = false;
  error = false;

  nombreSede: string = '';

  chartIngresos: Chart | null = null;
  chartEstados: Chart | null = null;

  displayedColumns: string[] = ['cliente', 'servicio', 'sede', 'fecha', 'estado'];

  sedeSeleccionada: string | null = null;

  sedes: any[] = [];

  diasSemanaMap: { [key: number]: string } = {
    1: 'Dom',
    2: 'Lun',
    3: 'Mar',
    4: 'Mié',
    5: 'Jue',
    6: 'Vie',
    7: 'Sáb',
    8: 'Dom'
  };

  constructor(
    private dashboardService: DashboardService,
    private sedeService: SedeService
  ) { }

  ngOnInit(): void {

    this.sedeSeleccionada = localStorage.getItem('sedeSeleccionada');

    this.cargarSedes();

    if (this.sedeSeleccionada) {
      this.cargarResumen();
    }

  }

  /* ================================
     🔥 KPI: PELUQUERO TOP
  ================================ */

  get peluqueroTopNombre(): string {
    return this.resumen?.peluqueroTop?.nombre || '—';
  }

  get peluqueroTopServicios(): number {
    return this.resumen?.peluqueroTop?.totalServicios || 0;
  }

  get existePeluqueroTop(): boolean {
    return !!this.resumen?.peluqueroTop;
  }

  /* ================================
     🔥 KPI: CLIENTE TOP (NUEVO)
  ================================ */

  get clienteTopNombre(): string {
    return this.resumen?.clienteTop?.nombre || '—';
  }

  get clienteTopServicios(): number {
    return this.resumen?.clienteTop?.totalServicios || 0;
  }

  get existeClienteTop(): boolean {
    return !!this.resumen?.clienteTop;
  }

  /* ================================
     🔥 KPI: PRODUCTOS TOP
  ================================ */

  get productosTop(): any[] {
    return this.resumen?.productosTop || [];
  }

  /* ================================
     CARGAR DASHBOARD
  ================================ */

  cargarResumen(): void {

    if (!this.sedeSeleccionada) return;

    this.loading = true;
    this.error = false;

    this.dashboardService
      .obtenerResumen(this.sedeSeleccionada)
      .subscribe({

        next: (data) => {

          this.resumen = data;
          this.loading = false;

          setTimeout(() => {
            this.crearGraficoIngresos();
            this.crearGraficoEstados();
          }, 0);

        },

        error: (err) => {

          console.error('Error cargando dashboard:', err);

          this.error = true;
          this.loading = false;

        }

      });

  }

  /* ================================
     CAMBIAR SEDE
  ================================ */

  cambiarSede(sede: any): void {

    const sedeId = typeof sede === 'string' ? sede : sede._id;

    this.sedeSeleccionada = sedeId;

    localStorage.setItem('sedeSeleccionada', sedeId);

    const sedeEncontrada = this.sedes.find(s => s._id === sedeId);

    if (sedeEncontrada) {
      this.nombreSede = sedeEncontrada.nombre;
    }

    this.cargarResumen();

  }

  /* ================================
     📊 GRÁFICO INGRESOS
  ================================ */

  crearGraficoIngresos(): void {

    if (!this.resumen?.ingresosSemana) return;

    const ctx = document.getElementById('graficoIngresos') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chartIngresos) {
      this.chartIngresos.destroy();
    }

    const ingresosOrdenados = [...this.resumen.ingresosSemana]
      .sort((a, b) => a._id - b._id);

    const labels = ingresosOrdenados.map(
      item => this.diasSemanaMap[item._id]
    );

    const dataActual = ingresosOrdenados.map(
      item => item.total
    );

    this.chartIngresos = new Chart(ctx, {

      type: 'line',

      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos semana actual',
            data: dataActual,
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        },
        plugins: {
          tooltip: {
            backgroundColor: '#111827',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) =>
                `$${Number(context.raw).toLocaleString()}`
            }
          },
          legend: {
            display: false
          }
        }
      }

    });

  }

  /* ================================
     📈 GRÁFICO ESTADOS
  ================================ */

  crearGraficoEstados(): void {

    if (!this.resumen?.estadosCitas) return;

    const ctx = document.getElementById('graficoEstados') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chartEstados) {
      this.chartEstados.destroy();
    }

    const labels = this.resumen.estadosCitas.map(item =>
      item._id.charAt(0).toUpperCase() + item._id.slice(1)
    );

    const data = this.resumen.estadosCitas.map(item => item.total);

    this.chartEstados = new Chart(ctx, {

      type: 'doughnut',

      data: {
        labels,
        datasets: [
          {
            data,
            borderWidth: 0
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateScale: true,
          duration: 1000
        },
        plugins: {
          tooltip: {
            backgroundColor: '#111827',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) =>
                `${context.label}: ${context.raw} citas`
            }
          },
          legend: {
            position: 'bottom'
          }
        }
      }

    });

  }

  /* ================================
     🏆 SERVICIOS TOP
  ================================ */

  calcularPorcentajeServicio(totalServicio: number): number {

    if (!this.resumen?.serviciosTop?.length) return 0;

    const max = Math.max(
      ...this.resumen.serviciosTop.map((s: any) => s.total)
    );

    return max > 0
      ? Math.round((totalServicio / max) * 100)
      : 0;

  }

  /* ================================
     🏆 PRODUCTOS TOP
  ================================ */

  calcularPorcentajeProducto(totalProducto: number): number {

    if (!this.resumen?.productosTop?.length) return 0;

    const max = Math.max(
      ...this.resumen.productosTop.map((p: any) => p.total)
    );

    return max > 0
      ? Math.round((totalProducto / max) * 100)
      : 0;

  }

  /* ================================
     📉 VARIACIÓN SEMANA
  ================================ */

  get variacionSemana(): number {
    return this.resumen?.comparacionSemana?.variacion || 0;
  }

  get esVariacionPositiva(): boolean {
    return this.variacionSemana >= 0;
  }

  /* ================================
     AUXILIARES
  ================================ */

  obtenerServiciosTexto(servicios: any[]): string {

    if (!servicios || servicios.length === 0) return '—';

    return servicios
      .map(s => s.nombre)
      .join(', ');

  }

  obtenerNombreCliente(cita: any): string {
    return cita?.cliente?.usuario?.nombre || '—';
  }

  obtenerNombreSede(cita: any): string {
    return cita?.sede?.nombre || '—';
  }

  cargarSedes(): void {

    this.sedeService.obtenerSedes()
      .subscribe({

        next: (data: any[]) => {

          this.sedes = data;

          if (this.sedeSeleccionada) {
            const sede = this.sedes.find(s => s._id === this.sedeSeleccionada);
            this.nombreSede = sede?.nombre || '';
          }

          if (!this.sedeSeleccionada && this.sedes.length > 0) {

            this.sedeSeleccionada = this.sedes[0]._id;
            this.nombreSede = this.sedes[0].nombre;

            if (this.sedeSeleccionada) {
              localStorage.setItem(
                'sedeSeleccionada',
                this.sedeSeleccionada
              );
            }

            this.cargarResumen();

          }

        },

        error: (err: any) => {
          console.error('Error cargando sedes', err);
        }

      });

  }

}