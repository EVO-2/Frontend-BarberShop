import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportesService } from 'src/app/core/services/reportes.service';
import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  ) { }

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
        if (!res || res.length === 0) {
          this.reportesInventario = [];
          this.cargando = false;
          return;
        }

        // 🔹 Convertimos estructura por sede → a filas planas para tabla
        const filas = res.flatMap((sedeObj: any) => {
          const equipos = sedeObj.equipos || [];

          const totalSede = equipos
            .reduce((acc: number, eq: any) => acc + (eq.cantidad || 0), 0);

          return equipos.map((eq: any) => ({
            sede: sedeObj.sede || 'N/D',
            equipo: eq.nombre || 'N/D',
            tipo: eq.tipo || 'No especificado',   // 🔥 NUEVO CAMPO
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

  // =============================
  // 📥 Exportar Excel
  // =============================
  exportarExcel(): void {
    let data: any[] = [];
    let titulo = 'Reporte';
    let sheetName = 'Datos';
    let colWidths: any[] = []; // Configuración de anchos de columna

    switch (this.tabSeleccionada) {
      case 0:
        data = this.citas;
        titulo = 'Reporte_Ingresos';
        colWidths = [{ wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 40 }, { wch: 15 }];
        break;
      case 1:
        data = this.reportesBarberos;
        titulo = 'Reporte_Barberos';
        colWidths = [{ wch: 30 }, { wch: 20 }];
        break;
      case 2:
        data = this.reportesClientes;
        titulo = 'Reporte_Clientes_Frecuentes';
        colWidths = [{ wch: 30 }, { wch: 15 }];
        break;
      case 3:
        data = this.reportesInventario;
        titulo = 'Reporte_Inventario';
        colWidths = [{ wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];
        break;
    }

    if (!data || data.length === 0) {
      this.snackBar.open('No hay datos para exportar.', 'Cerrar', { duration: 3000 });
      return;
    }

    // 🔹 Si es la pestaña de ingresos, clonamos data y agregamos la fila del TOTAL
    let exportData = [...data];
    if (this.tabSeleccionada === 0) {
      exportData.push({
        fecha: '',
        cliente: '',
        peluquero: '',
        serviciosStr: 'TOTAL INGRESOS',
        subtotal: this.total
      });
    }

    // Convertimos a hoja Excel
    const worksheet: xlsx.WorkSheet = xlsx.utils.json_to_sheet(exportData);

    // Damos ancho a las columnas para que no se vean apretadas (estética)
    worksheet['!cols'] = colWidths;

    // Generamos el libro
    const workbook: xlsx.WorkBook = { Sheets: { [sheetName]: worksheet }, SheetNames: [sheetName] };

    // Descargar
    xlsx.writeFile(workbook, `${titulo}_${new Date().getTime()}.xlsx`);
  }

  // =============================
  // 📄 Exportar PDF
  // =============================
  exportarPDF(): void {
    let data: any[] = [];
    let title = 'Reporte';
    let headers: string[] = [];
    let keys: string[] = [];

    switch (this.tabSeleccionada) {
      case 0:
        data = this.citas;
        title = 'Reporte de Ingresos';
        headers = ['Fecha', 'Cliente', 'Barbero', 'Servicios', 'Subtotal'];
        keys = ['fecha', 'cliente', 'peluquero', 'serviciosStr', 'subtotal'];
        break;
      case 1:
        data = this.reportesBarberos;
        title = 'Citas por Barbero';
        headers = ['Barbero', 'Citas Atendidas'];
        keys = ['barbero', 'cantidad'];
        break;
      case 2:
        data = this.reportesClientes;
        title = 'Clientes Frecuentes';
        headers = ['Cliente', 'Citas'];
        keys = ['cliente', 'cantidad'];
        break;
      case 3:
        data = this.reportesInventario;
        title = 'Reporte de Inventario';
        headers = ['Sede', 'Equipo', 'Tipo', 'Cantidad', 'Total Sede'];
        keys = ['sede', 'equipo', 'tipo', 'cantidad', 'totalSede'];
        break;
    }

    if (!data || data.length === 0) {
      this.snackBar.open('No hay datos para exportar.', 'Cerrar', { duration: 3000 });
      return;
    }

    const doc = new jsPDF();

    // 1️⃣ Añadimos Logo
    const logoImg = new Image();
    logoImg.src = 'assets/logo.png'; // Asegúrate de que este asset exista

    logoImg.onload = () => {
      // (imagen, formato, X, Y, Ancho, Alto)
      doc.addImage(logoImg, 'PNG', 14, 10, 40, 20);
      this.generarContenidoPDF(doc, title, headers, keys, data);
    };

    logoImg.onerror = () => {
      // Si el logo no carga (ej. no está en /assets), imprimimos el PDF sin logo pero no fallamos
      this.generarContenidoPDF(doc, title, headers, keys, data);
    };
  }

  private generarContenidoPDF(doc: jsPDF, title: string, headers: string[], keys: string[], data: any[]): void {
    // 2️⃣ Título Central
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    // Calcular el centro (ancho de hoja carta/A4 es ~210mm)
    doc.text(title.toUpperCase(), 105, 20, { align: 'center' });

    // 3️⃣ Fecha de Generación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const fechaActual = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fechaActual}`, 105, 27, { align: 'center' });

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, 196, 32);

    // 4️⃣ Preparar Datos para la Tabla
    const formatData = data.map(item => keys.map(k => {
      if (k === 'fecha' && item[k]) return new Date(item[k]).toLocaleDateString();
      if (k === 'subtotal' && item[k]) return `$ ${item[k].toLocaleString('es-CO')}`;
      return item[k] ?? '';
    }));

    // Preparar Footer si es la pestaña de Ingresos
    let footData: any[] = [];
    if (this.tabSeleccionada === 0) {
      footData = [['', '', '', 'TOTAL INGRESOS', `$ ${this.total.toLocaleString('es-CO')}`]];
    }

    // 5️⃣ Tabla Estilizada
    autoTable(doc, {
      head: [headers],
      body: formatData,
      foot: footData,
      startY: 40,
      theme: 'grid', // Malla profesional
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 4,
        textColor: [50, 50, 50], // Gris oscuro para mejor lectura
      },
      headStyles: {
        fillColor: [33, 33, 33], // Encabezado Gris oscuro casi negro
        textColor: [255, 255, 255], // Letra blanca
        fontStyle: 'bold',
        halign: 'center' // Centrar encabezados
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Filas intercaladas gris muy claro
      },
      footStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        // Por si necesitas alinear la última columna al extremo derecho (ej. precios)
        [keys.length - 1]: { halign: 'right' }
      }
    });

    // 6️⃣ Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // 7️⃣ Descargar
    doc.save(`${title.replace(/ /g, '_')}_${new Date().getTime()}.pdf`);
  }
}
