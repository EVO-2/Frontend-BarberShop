import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportesService } from 'src/app/core/services/reportes.service';

// === Interfaces de Tipado ===
interface CitaReporte {
  fecha: Date;
  cliente: string;
  peluquero: string;
  serviciosStr: string;
  subtotal: number;
}

interface BarberoReporte {
  barbero: string;
  cantidad: number;
}

interface ClienteFrecuente {
  cliente: string;
  cantidad: number;
}

interface InventarioReporte {
  producto: string;
  usos: number;
}

@Component({
  selector: 'app-reporte-ingresos',
  templateUrl: './reporte-ingresos.component.html',
  styleUrls: ['./reporte-ingresos.component.scss']
})
export class ReporteIngresosComponent implements OnInit {

  filtroForm!: FormGroup;

  // === 1️⃣ Ingresos ===
  citas: CitaReporte[] = [];
  cantidadCitas = 0;
  total = 0;

  // === 2️⃣ Barberos ===
  reportesBarberos: BarberoReporte[] = [];

  // === 3️⃣ Clientes frecuentes ===
  reportesClientes: ClienteFrecuente[] = [];

  // === 4️⃣ Inventario ===
  reportesInventario: InventarioReporte[] = [];

  cargando = false;
  tabSeleccionada = 0;

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.filtroForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  // =============================
  // 🧭 Cambiar de pestaña y cargar datos
  // =============================
  onTabChange(index: number): void {
    this.tabSeleccionada = index;

    switch (index) {
      case 0:
        this.obtenerReporteIngresos();
        break;
      case 1:
        this.obtenerReporteBarberos();
        break;
      case 2:
        this.obtenerReporteClientes();
        break;
      case 3:
        this.obtenerReporteInventario();
        break;
    }
  }

  // =============================
  // ✅ Validación de fechas
  // =============================
  private validarFechas(): boolean {
    const { fechaInicio, fechaFin } = this.filtroForm.value;
    if (!fechaInicio || !fechaFin) {
      this.snackBar.open('Por favor selecciona ambas fechas.', 'Cerrar', { duration: 3000 });
      return false;
    }
    return true;
  }

  // =============================
  // 1️⃣ Reporte de Ingresos
  // =============================
  obtenerReporteIngresos(): void {
    if (!this.validarFechas()) return;

    const { fechaInicio, fechaFin } = this.filtroForm.value;
    this.cargando = true;
    this.citas = [];
    this.total = 0;
    this.cantidadCitas = 0;

    this.reportesService.obtenerIngresos(fechaInicio, fechaFin).subscribe({
      next: (res) => {
        this.citas = (res.detalle || []).map((c: any) => ({
          fecha: c.fecha,
          cliente: c.cliente || 'N/D',
          peluquero: c.peluquero || 'N/D',
          serviciosStr: (c.servicios || []).map((s: any) => s.nombre).join(', '),
          subtotal: c.subtotal || 0
        }));

        this.cantidadCitas = this.citas.length;
        this.total = res.resumen?.ingresosTotales || 0;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar ingresos:', err);
        this.cargando = false;
        this.snackBar.open('Error al cargar el reporte de ingresos.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // =============================
  // 2️⃣ Reporte de Citas por Barbero
  // =============================
  obtenerReporteBarberos(): void {
    if (!this.validarFechas()) return;

    const { fechaInicio, fechaFin } = this.filtroForm.value;
    this.cargando = true;
    this.reportesBarberos = [];

    this.reportesService.obtenerCitasPorBarbero(fechaInicio, fechaFin).subscribe({
      next: (res) => {
       this.reportesBarberos = (res || []).map((r: any) => ({
        barbero: r.peluquero || 'N/D',
        cantidad: r.cantidadCitas || 0
      }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar barberos:', err);
        this.cargando = false;
        this.snackBar.open('Error al cargar el reporte de barberos.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // =============================
  // 3️⃣ Reporte de Clientes Frecuentes
  // =============================
  obtenerReporteClientes(): void {
    if (!this.validarFechas()) return;

    const { fechaInicio, fechaFin } = this.filtroForm.value;
    this.cargando = true;
    this.reportesClientes = [];

    this.reportesService.obtenerClientesFrecuentes(fechaInicio, fechaFin).subscribe({
      next: (res) => {
        this.reportesClientes = (res || []).map((r: any) => ({
          cliente: r.cliente || 'N/D',
          cantidad: r.cantidadCitas || 0
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes frecuentes:', err);
        this.cargando = false;
        this.snackBar.open('Error al cargar el reporte de clientes frecuentes.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // =============================
  // 4️⃣ Reporte de Inventario
  // =============================
  obtenerReporteInventario(): void {
    this.cargando = true;
    this.reportesInventario = [];

    this.reportesService.obtenerReporteInventario().subscribe({
      next: (res) => {
        this.reportesInventario = (res || []).map((r: any) => ({
          producto: r.producto || 'N/D',
          usos: r.usos || 0
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar inventario:', err);
        this.cargando = false;
        this.snackBar.open('Error al cargar el reporte de inventario.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // =============================
  // 🔄 Aplicar filtro manual
  // =============================
  aplicarFiltro(): void {
    switch (this.tabSeleccionada) {
      case 0:
        this.obtenerReporteIngresos();
        break;
      case 1:
        this.obtenerReporteBarberos();
        break;
      case 2:
        this.obtenerReporteClientes();
        break;
      case 3:
        this.obtenerReporteInventario();
        break;
    }
  }
}
