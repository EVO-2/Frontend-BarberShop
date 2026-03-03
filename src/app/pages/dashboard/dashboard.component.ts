import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule
  ]
})
export class DashboardComponent implements OnInit {

  resumen: DashboardResumen | null = null;
  loading = false;
  error = false;

  chartIngresos: Chart | null = null;
  chartEstados: Chart | null = null;

  displayedColumns: string[] = ['cliente', 'servicio', 'sede', 'fecha', 'estado'];

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

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.loading = true;
    this.error = false;

    this.dashboardService.obtenerResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.loading = false;

        // Renderizar gráficos después de obtener datos
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

  // ================================
  // 📊 GRÁFICO INGRESOS REALES
  // ================================
  crearGraficoIngresos(): void {

    if (!this.resumen?.ingresosSemana) return;

    const ctx = document.getElementById('graficoIngresos') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chartIngresos) {
      this.chartIngresos.destroy();
    }

    const ingresosOrdenados = [...this.resumen.ingresosSemana].sort((a, b) => a._id - b._id);

    const labels = ingresosOrdenados.map(item => this.diasSemanaMap[item._id]);
    const dataActual = ingresosOrdenados.map(item => item.total);

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
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: {
          tooltip: {
            backgroundColor: '#111827',
            padding: 12,
            cornerRadius: 8,
            callbacks: { label: (context) => `$${Number(context.raw).toLocaleString()}` }
          },
          legend: { display: false }
        }
      }
    });
  }

  // ================================
  // 📈 GRÁFICO ESTADOS REALES
  // ================================
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
      data: { labels, datasets: [{ data, borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateScale: true, duration: 1000 },
        plugins: {
          tooltip: {
            backgroundColor: '#111827',
            padding: 12,
            cornerRadius: 8,
            callbacks: { label: (context) => `${context.label}: ${context.raw} citas` }
          },
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // ================================
  // 🏆 SERVICIOS TOP (PORCENTAJE REAL)
  // ================================
  calcularPorcentajeServicio(totalServicio: number): number {
    if (!this.resumen?.serviciosTop?.length) return 0;

    const max = Math.max(...this.resumen.serviciosTop.map((s: any) => s.total));
    return max > 0 ? Math.round((totalServicio / max) * 100) : 0;
  }

  // ================================
  // 📉 VARIACIÓN SEMANA
  // ================================
  get variacionSemana(): number {
    return this.resumen?.comparacionSemana?.variacion || 0;
  }

  get esVariacionPositiva(): boolean {
    return this.variacionSemana >= 0;
  }

  // ================================
  // MÉTODOS AUXILIARES
  // ================================
  obtenerServiciosTexto(servicios: any[]): string {
    if (!servicios || servicios.length === 0) return '—';
    return servicios.map(s => s.nombre).join(', ');
  }

  obtenerNombreCliente(cita: any): string {
    return cita?.cliente?.usuario?.nombre || '—';
  }

  obtenerNombreSede(cita: any): string {
    return cita?.sede?.nombre || '—';
  }
}