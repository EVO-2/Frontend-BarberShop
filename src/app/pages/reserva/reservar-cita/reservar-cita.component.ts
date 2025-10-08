import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ReservaService } from 'src/app/shared/services/reserva.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ServicioCardDialogComponent } from 'src/app/shared/components/servicio-card-dialog/servicio-card-dialog.component';

interface PeluqueroDropdownItem {
  _id: string;
  nombre: string;
  puestoId: string;
  puestoNombre: string;
  ocupado: boolean;
}

@Component({
  selector: 'app-reservar-cita',
  templateUrl: './reservar-cita.component.html',
  styleUrls: ['./reservar-cita.component.scss']
})
export class ReservarCitaComponent implements OnInit {

  reservarForm!: FormGroup;

  rolUsuario: string = '';
  usuarioLogueado: any;

  clientes: any[] = [];
  sedes: any[] = [];
  servicios: any[] = [];

  peluquerosAll: any[] = [];
  puestos: any[] = [];
  peluquerosFiltrados: any[] = [];
  peluquerosDropdown: PeluqueroDropdownItem[] = [];

  fechaHoraInvalida = false;
  loading = false;

  esAdmin: boolean = false;

  puestoSeleccionado: { _id: string; nombre: string } | null = null;

  private ultimaFecha: Date | null = null;
  private ultimaHora: string | null = null;
  private ultimaSedeId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.usuarioLogueado = this.authService.getUsuario();
    this.rolUsuario = this.usuarioLogueado?.rol || '';
    this.esAdmin = this.rolUsuario === 'admin';

    this.initForm();
    this.cargarDatos();

    this.ctrl('fecha')?.valueChanges.subscribe(() => this.validarFechaHoraYActualizarOcupacion());
    this.ctrl('hora')?.valueChanges.subscribe(() => this.validarFechaHoraYActualizarOcupacion());
    this.ctrl('sede')?.valueChanges.subscribe(val => this.onSedeChange(val));
  }

  private initForm(): void {
    this.reservarForm = this.fb.group({
      ...(this.rolUsuario === 'admin' && {
        cliente: ['', Validators.required],
      }),
      sede: ['', Validators.required],
      peluquero: ['', Validators.required],
      puestoTrabajo: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      servicios: [[], Validators.required], // ✅ array de ids
      observaciones: ['']
    });
  }

  // ✅ Getter para acceder al control de servicios
  get serviciosArray() {
    return this.reservarForm.get('servicios') as any; // FormControl que contiene array de ids
  }

  // ✅ Comprueba si un servicio está seleccionado
  isServicioSelected(id: string): boolean {
    const current = this.serviciosArray?.value || [];
    return Array.isArray(current) && current.includes(id);
  }

  // ✅ Toggle manual (checkbox o card)
  toggleServicio(id: string, event: any) {
    const checked = (event && typeof event.checked !== 'undefined')
      ? !!event.checked
      : !this.isServicioSelected(id);

    const current: string[] = Array.isArray(this.serviciosArray.value)
      ? [...this.serviciosArray.value]
      : [];

    if (checked) {
      if (!current.includes(id)) current.push(id);
    } else {
      const idx = current.indexOf(id);
      if (idx > -1) current.splice(idx, 1);
    }

    this.serviciosArray.setValue(current);
    this.serviciosArray.markAsTouched();
  }

  // ✅ Toggle al hacer click sobre la card
  toggleServicioOnCard(id: string, event: Event) {
    event?.stopPropagation();
    const selected = this.isServicioSelected(id);
    this.toggleServicio(id, { checked: !selected });
  }

  private ctrl(name: string): AbstractControl | null {
    return this.reservarForm.get(name);
  }

  private cargarDatos(): void {
    if (this.esAdmin) {
      this.reservaService.getClientes().subscribe({
        next: res => this.clientes = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []),
        error: err => console.error('[ReservarCita] getClientes error:', err)
      });
    }

    this.reservaService.getSedes().subscribe({
      next: res => this.sedes = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []),
      error: err => console.error('[ReservarCita] getSedes error:', err)
    });

    this.reservaService.getServicios().subscribe({
      next: res => this.servicios = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []),
      error: err => console.error('[ReservarCita] getServicios error:', err)
    });

    const obs$ = this.rolUsuario === 'cliente'
      ? this.reservaService.getPeluquerosDisponibles()
      : this.reservaService.getPeluqueros();

    obs$.subscribe({
      next: res => {
        const pelArray = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.peluquerosAll = pelArray.map((p: any) => ({ ...p, __nombreCalc: this.getNombrePeluquero(p) }));
      },
      error: err => console.error('[ReservarCita] cargarDatos peluqueros error:', err)
    });
  }

  onSedeChange(sedeId: string): void {
    this.ctrl('peluquero')?.setValue('');
    this.ctrl('puestoTrabajo')?.setValue('');
    this.puestoSeleccionado = null;
    this.puestos = [];
    this.peluquerosFiltrados = [];
    this.peluquerosDropdown = [];

    if (!sedeId) return;

    this.reservaService.getPuestosPorSede(sedeId).subscribe({
      next: res => {
        const puestosArray = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.puestos = puestosArray;

        this.peluquerosFiltrados = (this.peluquerosAll || []).filter(p => {
          const sedePel = this.extractId(p?.sede);
          const activo = p?.estado !== false && p?.usuario?.estado !== false;
          return activo && sedePel === sedeId;
        });

        this.peluquerosDropdown = this.peluquerosFiltrados.map(p => {
          const puestoId = this.extractId(p?.puestoTrabajo) || '';
          const puestoNombre =
            typeof p?.puestoTrabajo === 'object' && p?.puestoTrabajo?.nombre
              ? p.puestoTrabajo.nombre
              : (this.puestos.find(pt => pt?._id === puestoId)?.nombre || 'Sin puesto');
          return {
            _id: p._id,
            nombre: p.__nombreCalc,
            puestoId,
            puestoNombre,
            ocupado: false
          };
        });

        this.validarFechaHoraYActualizarOcupacion();
      },
      error: err => console.error('[ReservarCita] getPuestosPorSede error:', err)
    });
  }

  onPeluqueroChange(peluqueroId: string): void {
    const pel = this.peluquerosDropdown.find(p => p._id === peluqueroId);
    if (!pel) {
      this.ctrl('puestoTrabajo')?.setValue('');
      this.puestoSeleccionado = null;
      return;
    }
    this.ctrl('puestoTrabajo')?.setValue(pel.puestoId);
    this.puestoSeleccionado = { _id: pel.puestoId, nombre: pel.puestoNombre };
  }

  validarFechaHoraYActualizarOcupacion(): void {
    let fecha = this.ctrl('fecha')?.value;
    let hora = this.ctrl('hora')?.value;
    let sedeId = this.ctrl('sede')?.value;

    if (!fecha && this.ultimaFecha) fecha = this.ultimaFecha;
    if (!hora && this.ultimaHora) hora = this.ultimaHora;
    if (!sedeId && this.ultimaSedeId) sedeId = this.ultimaSedeId;

    if (!sedeId || !fecha || !hora) {
      this.fechaHoraInvalida = false;
      this.peluquerosDropdown = (this.peluquerosDropdown || []).map(p => ({ ...p, ocupado: false }));
      return;
    }

    this.ultimaFecha = fecha;
    this.ultimaHora = hora;
    this.ultimaSedeId = sedeId;

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
      this.ctrl('hora')?.setErrors({ pattern: true });
      return;
    }

    const fechaSeleccionada = this.combinarFechaHora(fecha, hora);

    this.reservaService.getCitasPorFechaYHora(sedeId, fechaSeleccionada.toISOString()).subscribe({
      next: res => {
        const citasArray: any[] = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        const citasActivas = citasArray.filter(c => c.estado !== 'cancelada');
        const idsOcupados = new Set<string>();

        citasActivas.forEach(c => {
          const inicioCita = new Date(c.fecha);
          const duracionCita = (c.servicios || []).reduce((t: number, sId: string) => {
            const servicio = this.servicios.find(s => s._id === sId);
            return t + (servicio?.duracion || 30);
          }, 0);
          const finCita = new Date(inicioCita.getTime() + duracionCita * 60 * 1000);

          if (fechaSeleccionada < finCita && new Date(fechaSeleccionada.getTime() + 60 * 60 * 1000) > inicioCita) {
            const peluqueroId = this.extractId(c.peluquero);
            if (peluqueroId) idsOcupados.add(peluqueroId);
          }
        });

        this.peluquerosDropdown = (this.peluquerosDropdown || []).map(item => ({
          ...item,
          ocupado: idsOcupados.has(item._id)
        }));

        const pelSel = this.ctrl('peluquero')?.value;
        this.fechaHoraInvalida = pelSel && idsOcupados.has(pelSel);
      },
      error: err => console.error('[ReservarCita] getCitasPorFechaYHora error:', err)
    });
  }

  // ✅ Nuevo método para abrir el diálogo de detalles del servicio
  verDetalleServicio(servicio: any): void {
    this.dialog.open(ServicioCardDialogComponent, {
      width: '600px',
      data: servicio
    });
  }

  reservarCita(): void {
    if (this.reservarForm.invalid || this.fechaHoraInvalida) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const { fecha, hora, sede, cliente, peluquero, puestoTrabajo, servicios, observaciones } = this.reservarForm.value;
    const fechaBase = this.combinarFechaHora(fecha, hora);

    if (isNaN(fechaBase.getTime())) {
      this.snackBar.open('❌ Fecha u hora inválida', 'Cerrar', { duration: 3000 });
      return;
    }

    // 🕓 VALIDACIÓN: no permitir fechas pasadas
    const ahora = new Date();
    if (fechaBase.getTime() < ahora.getTime()) {
      this.snackBar.open('⚠️ No puedes agendar una cita en una fecha u hora pasada', 'Cerrar', { duration: 3500 });
      return;
    }

    const clienteId = this.rolUsuario === 'cliente'
      ? this.usuarioLogueado?.clienteId 
      : cliente;

    const citaData = {
      cliente: clienteId,
      sede,
      peluquero,
      puestoTrabajo,
      servicios,
      fecha: fechaBase.toISOString(),
      fechaBase: fechaBase.toISOString(),
      hora,
      observacion: observaciones || ''
    };

    this.reservaService.crearCita(citaData).subscribe({
      next: (res) => {
        console.log('[ReservarCita] Cita creada:', res);
        this.snackBar.open('✅ Cita creada exitosamente', 'Cerrar', { duration: 3000 });
        this.validarFechaHoraYActualizarOcupacion();
        this.cancelarCita();
      },
      error: (err) => {
        console.error('[ReservarCita] Error al crear cita:', err);
        const mensaje = err.error?.mensaje?.includes('duplicate key')
          ? '❌ El peluquero ya tiene una cita en esa fecha y hora.'
          : err.error?.mensaje || '❌ Error al crear cita';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
      }
    });
  }


  cancelarCita(): void {
    this.reservarForm.reset();
    this.peluquerosDropdown = [];
    this.peluquerosFiltrados = [];
    this.puestos = [];
    this.fechaHoraInvalida = false;
    this.puestoSeleccionado = null;
  }

  private combinarFechaHora(fecha: any, hora: string): Date {
    try {
      const [h, m] = hora.split(':').map(Number);
      const f = new Date(fecha);
      return new Date(f.getFullYear(), f.getMonth(), f.getDate(), h, m, 0, 0);
    } catch {
      return new Date(NaN);
    }
  }

  private extractId(val: any): string | null {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val._id) return val._id;
    return null;
  }

  private getNombrePeluquero(p: any): string {
    if (p?.nombre) return p.nombre;
    const u = p?.usuario;
    if (typeof u === 'string') return u;
    if (u?.nombre) return u.nombre;
    return 'Sin nombre';
  }

  private toISODate(d: any): string {
    try { return new Date(d).toISOString().split('T')[0]; } 
    catch { return ''; }
  }

  // 🔹 Mantengo este método para compatibilidad con mat-selection-list
  onServiciosChange(selectedIds: string[]) {
    this.serviciosArray.setValue(selectedIds);
    this.serviciosArray.markAsTouched();
  }
}
