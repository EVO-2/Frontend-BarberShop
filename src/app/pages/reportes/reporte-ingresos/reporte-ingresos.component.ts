import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportesService } from 'src/app/core/services/reportes.service';
import { SedeService, Sede } from 'src/app/core/services/sede.service';
import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// === Interfaces de Tipado ===

interface CitaReporte {
  fecha: Date;
  sede?: string;
  cliente: string;
  peluquero: string;
  serviciosStr: string;
  subtotal: number;
}

interface BarberoReporte {
  sede?: string;
  barbero: string;
  cantidad: number;
}

interface ClienteFrecuente {
  sede?: string;
  cliente: string;
  cantidad: number;
}

interface InventarioReporte {
  sede: string;
  equipo: string;
  tipo: string;
  cantidad: number;
  totalSede: number;
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
  promedio: number = 0;
  totalServicios: number = 0;
  ingresosPorSede: { [key: string]: number } = {};

  // === 2️⃣ Barberos ===
  reportesBarberos: BarberoReporte[] = [];

  // === 3️⃣ Clientes frecuentes ===
  reportesClientes: ClienteFrecuente[] = [];

  // === 4️⃣ Inventario ===
  reportesInventario: InventarioReporte[] = [];

  // === 5️⃣ Productos ===
  reportesProductos: any[] = [];

  sedes: Sede[] = [];

  cargando = false;
  tabSeleccionada = 0;

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService,
    private sedeService: SedeService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.filtroForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: [''],
      sede: ['']
    });
    this.obtenerSedes();
  }

  obtenerSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes;
      },
      error: (err) => {
        console.error('Error al cargar sedes:', err);
      }
    });
  }

  // =============================
  // 🧭 Cambiar de pestaña
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
      case 4:
        this.obtenerReporteProductos();
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

    const { fechaInicio, fechaFin, sede } = this.filtroForm.value;

    this.cargando = true;

    this.citas = [];
    this.total = 0;
    this.cantidadCitas = 0;
    this.promedio = 0;
    this.totalServicios = 0;
    this.ingresosPorSede = {};

    this.reportesService.obtenerIngresos(fechaInicio, fechaFin, sede).subscribe({

      next: (res: any) => {

        const detalle = res?.detalle ?? [];
        const resumen = res?.resumen ?? {};

        // 🔹 NUEVO: ingresos agrupados por sede
        this.ingresosPorSede = res?.ingresosPorSede ?? {};

        // 🔹 Mapear citas
        this.citas = detalle.map((c: any) => ({
          fecha: c.fecha,
          sede: c.sede || 'N/D',
          cliente: c.cliente || 'N/D',
          peluquero: c.peluquero || 'N/D',
          serviciosStr: (c.servicios && c.servicios.length > 0)
            ? c.servicios.map((s: any) => `${s.nombre} ($${s.precio})`).join(', ')
            : 'Servicio Eliminado del Sistema',
          subtotal: c.subtotal || 0
        }));

        // 🔹 Resumen financiero
        this.cantidadCitas = resumen?.cantidadCitas ?? 0;
        this.total = resumen?.ingresosTotales ?? 0;
        this.promedio = Number(resumen?.promedioPorCita ?? 0);
        this.totalServicios = resumen?.totalServicios ?? 0;

        this.cargando = false;

      },

      error: (err) => {

        console.error('❌ Error al cargar ingresos:', err);

        this.cargando = false;

        this.snackBar.open(
          'Error al cargar el reporte de ingresos.',
          'Cerrar',
          { duration: 3000 }
        );

      }

    });

  }

  // =============================
  // 2️⃣ Reporte Barberos
  // =============================

  obtenerReporteBarberos(): void {

    if (!this.validarFechas()) return;

    const { fechaInicio, fechaFin, sede } = this.filtroForm.value;

    this.cargando = true;
    this.reportesBarberos = [];

    this.reportesService.obtenerCitasPorBarbero(fechaInicio, fechaFin, sede).subscribe({

      next: (res: any) => {

        this.reportesBarberos = (res || []).map((r: any) => ({
          sede: r.sede || 'N/D',
          barbero: r.peluquero || 'N/D',
          cantidad: r.cantidadCitas || 0
        }));

        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al cargar barberos:', err);

        this.cargando = false;

        this.snackBar.open(
          'Error al cargar el reporte de barberos.',
          'Cerrar',
          { duration: 3000 }
        );

      }

    });

  }


  // =============================
  // 3️⃣ Clientes frecuentes
  // =============================

  obtenerReporteClientes(): void {

    if (!this.validarFechas()) return;

    const { fechaInicio, fechaFin, sede } = this.filtroForm.value;

    // 🔹 Ajustar rango completo del día
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    this.cargando = true;
    this.reportesClientes = [];

    this.reportesService.obtenerClientesFrecuentes(fechaInicio, fechaFin, sede).subscribe({

      next: (res: any) => {

        this.reportesClientes = (res || []).map((r: any) => ({
          sede: r.sede || 'N/D',
          cliente: r.cliente || 'N/D',
          cantidad: r.cantidadCitas || 0
        }));

        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al cargar clientes frecuentes:', err);

        this.cargando = false;

        this.snackBar.open(
          'Error al cargar el reporte de clientes frecuentes.',
          'Cerrar',
          { duration: 3000 }
        );

      }

    });

  }


  // =============================
  // 4️⃣ Inventario
  // =============================

  obtenerReporteInventario(): void {

    const { sede } = this.filtroForm.value;

    this.cargando = true;
    this.reportesInventario = [];

    this.reportesService.obtenerReporteInventario(sede).subscribe({

      next: (res) => {

        if (!res || res.length === 0) {

          this.reportesInventario = [];
          this.cargando = false;
          return;

        }

        const filas = res.flatMap((sedeObj: any) => {

          const equipos = sedeObj.equipos || [];

          const totalSede = equipos
            .reduce((acc: number, eq: any) => acc + (eq.cantidad || 0), 0);

          return equipos.map((eq: any) => ({
            sede: sedeObj.sede || 'N/D',
            equipo: eq.nombre || 'N/D',
            tipo: eq.tipo || 'No especificado',
            cantidad: eq.cantidad || 0,
            totalSede: totalSede
          }));

        });

        this.reportesInventario = filas;

        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al cargar inventario:', err);

        this.cargando = false;

        this.snackBar.open(
          'Error al cargar el reporte de inventario.',
          'Cerrar',
          { duration: 3000 }
        );

      }

    });

  }

  // =============================
  // 5️⃣ Reporte Productos
  // =============================

  obtenerReporteProductos(): void {

    const { sede } = this.filtroForm.value;

    this.cargando = true;
    this.reportesProductos = [];

    this.reportesService.obtenerReporteProductos(sede).subscribe({
      next: (res) => {
        if (!res || res.length === 0) {
          this.reportesProductos = [];
          this.cargando = false;
          return;
        }

        const filas: any[] = [];
        res.forEach((sedeObj: any) => {
          const categorias = sedeObj.categorias || [];
          if (categorias.length > 0) {
            categorias.forEach((cat: any) => {
              filas.push({
                sede: sedeObj.sede || 'N/D',
                categoria: cat.categoria || 'N/D',
                cantidad: cat.cantidad || 0,
                totalSede: sedeObj.totalSede || 0
              });
            });
          } else {
            filas.push({
              sede: sedeObj.sede || 'N/D',
              categoria: 'Sin categorías',
              cantidad: 0,
              totalSede: sedeObj.totalSede || 0
            });
          }
        });

        this.reportesProductos = filas;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cargando = false;
        this.snackBar.open('Error al cargar el reporte de productos.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // =============================
  // 🔄 Aplicar filtro
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

      case 4:
        this.obtenerReporteProductos();
        break;

    }

  }

  // =============================
  // 📥 Exportar Excel Profesional
  // =============================
  exportarExcel(): void {

    let data: any[] = [];
    let titulo = 'Reporte';
    let sheetName = 'Datos';
    let colWidths: any[] = [];

    const barberiaNombre = document.title || 'Sistema de Gestión';

    const fechaColombia = new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date());

    switch (this.tabSeleccionada) {

      // =============================
      // INGRESOS
      // =============================
      case 0:

        titulo = 'Reporte_Ingresos';
        sheetName = 'Ingresos';

        colWidths = [
          { wch: 18 },
          { wch: 20 },
          { wch: 25 },
          { wch: 25 },
          { wch: 40 },
          { wch: 15 }
        ];

        data = this.citas.map((c: any) => ({

          Fecha: new Intl.DateTimeFormat('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).format(new Date(c.fecha)),

          Sede: c.sede ?? 'N/D',

          Cliente: c.cliente ?? 'N/D',

          Barbero: c.peluquero ?? 'N/D',

          Servicios: c.serviciosStr ?? '',

          Subtotal: c.subtotal ?? 0

        }));

        break;

      // =============================
      // BARBEROS
      // =============================
      case 1:

        titulo = 'Reporte_Barberos';
        sheetName = 'Barberos';

        colWidths = [
          { wch: 25 },
          { wch: 30 },
          { wch: 15 }
        ];

        data = this.reportesBarberos.map((r: any) => ({

          Sede: r.sede ?? 'N/D',

          Barbero: r.peluquero ?? 'N/D',

          Citas: r.cantidadCitas ?? r.cantidad ?? 0

        }));

        break;

      // =============================
      // CLIENTES FRECUENTES
      // =============================
      case 2:

        titulo = 'Reporte_Clientes_Frecuentes';
        sheetName = 'Clientes';

        colWidths = [
          { wch: 25 },
          { wch: 30 },
          { wch: 15 }
        ];

        data = this.reportesClientes.map((r: any) => ({

          Sede: r.sede ?? 'N/D',

          Cliente: r.cliente ?? 'N/D',

          Citas: r.cantidadCitas ?? r.cantidad ?? 0

        }));

        break;

      // =============================
      // INVENTARIO
      // =============================
      case 3:

        titulo = 'Reporte_Inventario';
        sheetName = 'Inventario';

        colWidths = [
          { wch: 25 },
          { wch: 30 },
          { wch: 15 },
          { wch: 20 }
        ];

        data = [];

        if (Array.isArray(this.reportesInventario)) {

          this.reportesInventario.forEach((sede: any) => {

            // FORMATO AGRUPADO
            if (Array.isArray(sede?.equipos)) {

              sede.equipos.forEach((eq: any) => {

                data.push({
                  Sede: sede?.sede ?? 'N/D',
                  Tipo: eq?.tipo ?? 'N/D',
                  Cantidad: eq?.cantidad ?? 0,
                  'Total Sede': sede?.totalSede ?? 0
                });

              });

            }

            // FORMATO PLANO (nuevo backend)
            else {

              data.push({
                Sede: sede?.sede ?? 'N/D',
                Tipo: sede?.tipo ?? 'N/D',
                Cantidad: sede?.cantidad ?? 0,
                'Total Sede': sede?.totalSede ?? sede?.cantidad ?? 0
              });

            }

          });

        }

        break;

      // =============================
      // PRODUCTOS
      // =============================
      case 4:

        titulo = 'Reporte_Productos';
        sheetName = 'Productos';

        colWidths = [
          { wch: 25 },
          { wch: 30 },
          { wch: 15 },
          { wch: 20 }
        ];

        data = this.reportesProductos.map((p: any) => ({
          Sede: p.sede ?? 'N/D',
          Categoria: p.categoria ?? 'N/D',
          Cantidad: p.cantidad ?? 0,
          'Total Sede': p.totalSede ?? 0
        }));

        break;

    }

    if (!data || data.length === 0) {

      this.snackBar.open('No hay datos para exportar.', 'Cerrar', { duration: 3000 });

      return;

    }

    // =============================
    // CREAR WORKSHEET
    // =============================
    const worksheet: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);

    const header = [

      [`${barberiaNombre}`],

      ['Sistema de Gestión de Barbería'],

      [titulo.replace(/_/g, ' ')],

      [`Generado: ${fechaColombia}`],

      []

    ];

    xlsx.utils.sheet_add_aoa(worksheet, header, { origin: 'A1' });

    xlsx.utils.sheet_add_json(
      worksheet,
      data,
      {
        origin: 'A6',
        skipHeader: false
      }
    );

    worksheet['!cols'] = colWidths;

    const workbook: xlsx.WorkBook = {

      Sheets: { [sheetName]: worksheet },

      SheetNames: [sheetName]

    };

    xlsx.writeFile(

      workbook,

      `${titulo}_${new Date().toISOString().slice(0, 10)}.xlsx`

    );

  }

  // =============================
  // 📄 Exportar PDF Profesional (Nivel ERP)
  // =============================
  exportarPDF(): void {

    let data: any[] = [];
    let title = 'Reporte';
    let headers: string[] = [];
    let keys: string[] = [];

    const barberiaNombre = document.title || 'Sistema de Gestión';

    const fechaColombia = new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date());

    // =============================
    // SELECCION DE REPORTE
    // =============================
    switch (this.tabSeleccionada) {

      case 0:

        data = this.citas;

        title = 'Reporte de Ingresos';

        headers = ['Fecha', 'Sede', 'Cliente', 'Barbero', 'Servicios', 'Subtotal'];

        keys = ['fecha', 'sede', 'cliente', 'peluquero', 'serviciosStr', 'subtotal'];

        break;

      case 1:

        data = this.reportesBarberos;

        title = 'Citas por Barbero';

        headers = ['Sede', 'Barbero', 'Citas'];

        keys = ['sede', 'barbero', 'cantidad'];

        break;


      case 2:

        data = this.reportesClientes;

        title = 'Citas por Cliente';

        headers = ['Sede', 'Cliente', 'Citas'];

        keys = ['sede', 'cliente', 'cantidad'];


        break;

      case 3:

        title = 'Reporte de Inventario';

        headers = ['Sede', 'Tipo', 'Cantidad', 'Total Sede'];

        keys = ['sede', 'tipo', 'cantidad', 'totalSede'];

        data = [];

        if (Array.isArray(this.reportesInventario)) {

          this.reportesInventario.forEach((sede: any) => {

            if (Array.isArray(sede?.equipos)) {

              sede.equipos.forEach((eq: any) => {

                data.push({
                  sede: sede?.sede ?? 'N/D',
                  tipo: eq?.tipo ?? 'N/D',
                  cantidad: eq?.cantidad ?? 0,
                  totalSede: sede?.totalSede ?? 0
                });

              });

            } else {

              data.push({
                sede: sede?.sede ?? 'N/D',
                tipo: sede?.tipo ?? 'N/D',
                cantidad: sede?.cantidad ?? 0,
                totalSede: sede?.totalSede ?? sede?.cantidad ?? 0
              });

            }

          });

        }

        break;

      case 4:

        title = 'Reporte de Productos (Inventario)';

        headers = ['Sede', 'Categoría', 'Cantidad', 'Total Sede'];

        keys = ['sede', 'categoria', 'cantidad', 'totalSede'];

        data = this.reportesProductos;

        break;

    }

    if (!data || data.length === 0) {

      this.snackBar.open('No hay datos para exportar.', 'Cerrar', { duration: 3000 });

      return;

    }

    // =============================
    // NORMALIZAR DATOS
    // =============================
    const bodyData = data.map(row => {

      return keys.map(k => {

        let value = row[k];

        if (k === 'fecha' && value) {

          value = new Intl.DateTimeFormat('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).format(new Date(value));

        }

        if (typeof value === 'object' && value !== null) {

          value =
            value.nombre ||
            value.name ||
            value.descripcion ||
            value.tipo ||
            'N/D';

        }

        return value ?? 'N/D';

      });

    });

    const doc = new jsPDF();

    const logo = new Image();

    logo.src = 'assets/sede.png';

    logo.onload = () => {

      doc.addImage(logo, 'PNG', 14, 10, 30, 15);

      doc.setFontSize(14);
      doc.text(barberiaNombre, 105, 15, { align: 'center' });

      doc.setFontSize(18);
      doc.text(title, 105, 25, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Generado: ${fechaColombia}`, 105, 32, { align: 'center' });

      let startY = 40;

      // =============================
      // DASHBOARD FINANCIERO
      // =============================
      if (this.tabSeleccionada === 0) {

        const totalIngresos = data.reduce((acc, c) => acc + (c.subtotal || 0), 0);
        const totalCitas = data.length;
        const promedio = totalIngresos / (totalCitas || 1);

        doc.setFillColor(240, 240, 240);

        doc.rect(14, startY, 60, 18, 'F');
        doc.rect(80, startY, 60, 18, 'F');
        doc.rect(146, startY, 50, 18, 'F');

        doc.setFontSize(10);

        doc.text('Total Ingresos', 18, startY + 6);
        doc.text(`$${totalIngresos.toLocaleString('es-CO')}`, 18, startY + 12);

        doc.text('Total Citas', 84, startY + 6);
        doc.text(`${totalCitas}`, 84, startY + 12);

        doc.text('Promedio', 150, startY + 6);
        doc.text(`$${Math.round(promedio).toLocaleString('es-CO')}`, 150, startY + 12);

        startY += 26;

        // TOP BARBEROS
        const ranking: any = {};

        this.citas.forEach((c: any) => {
          ranking[c.peluquero] = (ranking[c.peluquero] || 0) + 1;
        });

        const topBarberos = Object.entries(ranking)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 5);

        doc.setFontSize(11);
        doc.text('Top 5 Barberos', 14, startY);

        topBarberos.forEach((b: any, i: number) => {
          doc.text(`${i + 1}. ${b[0]} - ${b[1]} citas`, 14, startY + 6 + (i * 5));
        });

        startY += 35;

        // =============================
        // NUEVA SECCION: INGRESOS POR SEDE
        // =============================
        const ingresosPorSede: any = {};

        this.citas.forEach((c: any) => {
          const sede = c.sede || 'N/D';
          ingresosPorSede[sede] = (ingresosPorSede[sede] || 0) + (c.subtotal || 0);
        });

        const rankingSedes = Object.entries(ingresosPorSede)
          .sort((a: any, b: any) => b[1] - a[1]);

        doc.setFontSize(11);
        doc.text('Ingresos por sede', 14, startY);

        rankingSedes.forEach((s: any, i: number) => {

          doc.text(
            `${s[0]}   $${s[1].toLocaleString('es-CO')} COP`,
            14,
            startY + 6 + (i * 5)
          );

        });

        startY += 10 + rankingSedes.length * 5;

      }

      // =============================
      // INVENTARIO CRITICO
      // =============================
      if (this.tabSeleccionada === 3) {

        const criticos = data.filter(i => i.cantidad <= 2);

        if (criticos.length) {

          doc.setTextColor(200, 0, 0);

          doc.text('Inventario Crítico:', 14, startY);

          criticos.forEach((item, index) => {

            doc.text(
              `${item.tipo} - ${item.cantidad} unidades`,
              14,
              startY + 6 + index * 5
            );

          });

          doc.setTextColor(0, 0, 0);

          startY += 10 + criticos.length * 5;

        }

      }

      // =============================
      // TABLA
      // =============================
      autoTable(doc, {

        head: [headers],

        body: bodyData,

        startY: startY,

        theme: 'grid',

        headStyles: { fillColor: [30, 30, 30] },

        styles: { fontSize: 9 }

      });

      // =============================
      // RESUMEN DE INGRESOS
      // =============================
      if (this.tabSeleccionada === 0) {

        const totalIngresos = data.reduce((acc, c) => acc + (c.subtotal || 0), 0);
        const totalCitas = data.length;
        const promedio = totalIngresos / (totalCitas || 1);

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(11);

        doc.text(`Total Ingresos: $${totalIngresos.toLocaleString('es-CO')}`, 14, finalY);
        doc.text(`Total Citas: ${totalCitas}`, 14, finalY + 6);
        doc.text(`Promedio por cita: $${Math.round(promedio).toLocaleString('es-CO')}`, 14, finalY + 12);

      }

      // =============================
      // FOOTER
      // =============================
      const pageCount = (doc as any).internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {

        doc.setPage(i);

        doc.setFontSize(8);

        doc.text(
          `Página ${i} de ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );

      }

      doc.save(`${title.replace(/ /g, '_')}_${Date.now()}.pdf`);

    };

  }

}