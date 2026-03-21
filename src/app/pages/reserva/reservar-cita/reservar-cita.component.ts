import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ReservaService } from 'src/app/shared/services/reserva.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ServicioCardDialogComponent } from 'src/app/shared/components/servicio-card-dialog/servicio-card-dialog.component';
import { environment } from 'src/environments/environment';

interface PeluqueroDropdownItem {
  _id: string;
  nombre: string;
  puestoId: string;
  puestoNombre: string;
  ocupado: boolean;
  foto?: string;
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

  fotoPeluqueroSeleccionado: string = 'assets/img/default-avatar.png';

  fechaHoraInvalida = false;
  loading = false;

  fechaMinima: Date = new Date();

  horasDisponibles: string[] = [];

  horaApertura = 9;
  horaCierre = 19;
  intervaloMinutos = 30;

  esAdmin: boolean = false;

  puestoSeleccionado: { _id: string; nombre: string } | null = null;

  private ultimaFecha: Date | null = null;
  private ultimaHora: string | null = null;
  private ultimaSedeId: string | null = null;


  private servicioIdFromQuery: string | null = null;

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.usuarioLogueado = this.authService.getUsuario();
    this.rolUsuario = this.usuarioLogueado?.rol || '';
    this.esAdmin = this.rolUsuario === 'admin';


    this.route.queryParams.subscribe((params: any) => {
      this.servicioIdFromQuery = params['servicioId'] || null;
    });

    this.initForm();
    this.cargarDatos();

    this.ctrl('fecha')?.valueChanges.subscribe(() => {

      this.generarHorasDisponibles();

      this.validarFechaHoraYActualizarOcupacion();

    });

    this.ctrl('hora')?.valueChanges.subscribe(() => {
      this.validarFechaHoraYActualizarOcupacion();
    });

    this.ctrl('sede')?.valueChanges.subscribe(val => {
      this.onSedeChange(val);
    });
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
      servicios: [[], Validators.required],
      observaciones: ['']
    });
  }

  get serviciosArray() {
    return this.reservarForm.get('servicios') as any;
  }

  isServicioSelected(id: string): boolean {
    return (this.serviciosArray?.value || []).includes(id);
  }

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
        next: res => {
          this.clientes = Array.isArray(res.data) ? res.data : res;
        }
      });
    }

    this.reservaService.getSedes().subscribe({
      next: res => {
        this.sedes = Array.isArray(res.data) ? res.data : res;
      }
    });

    this.reservaService.getServicios().subscribe({
      next: res => {
        this.servicios = Array.isArray(res.data) ? res.data : res;

        if (this.servicioIdFromQuery) {
          this.seleccionarServicioAutomaticamente(this.servicioIdFromQuery);
        }
      }
    });

    const obs$ = this.rolUsuario === 'cliente'
      ? this.reservaService.getPeluquerosDisponibles()
      : this.reservaService.getPeluqueros();

    obs$.subscribe({
      next: res => {
        const pelArray = Array.isArray(res.data) ? res.data : res;

        this.peluquerosAll = pelArray.map((p: any) => ({
          ...p,
          __nombreCalc: this.getNombrePeluquero(p)
        }));
      }
    });
  }


  private seleccionarServicioAutomaticamente(servicioId: string): void {

    const current: string[] = Array.isArray(this.serviciosArray.value)
      ? [...this.serviciosArray.value]
      : [];

    if (!current.includes(servicioId)) {
      current.push(servicioId);
      this.serviciosArray.setValue(current);
      this.serviciosArray.markAsTouched();
    }
  }

  onSedeChange(sedeId: string): void {
    this.ctrl('peluquero')?.setValue('');
    this.ctrl('puestoTrabajo')?.setValue('');

    this.puestos = [];
    this.peluquerosFiltrados = [];
    this.peluquerosDropdown = [];

    if (!sedeId) return;

    this.reservaService.getPuestosPorSede(sedeId).subscribe({
      next: res => {
        this.puestos = Array.isArray(res.data) ? res.data : res;

        this.peluquerosFiltrados = this.peluquerosAll.filter(p => {
          const sedePel = this.extractId(p?.sede);
          const activo = p?.estado !== false && p?.usuario?.estado !== false;
          return activo && sedePel === sedeId;
        });

        this.peluquerosDropdown = this.peluquerosFiltrados.map(p => {
          const puestoId = this.extractId(p?.puestoTrabajo) || '';
          const puestoNombre =
            typeof p?.puestoTrabajo === 'object' ? p.puestoTrabajo?.nombre
              : this.puestos.find(pt => pt?._id === puestoId)?.nombre || 'Sin puesto';

          return {
            _id: p._id,
            nombre: p.__nombreCalc,
            puestoId,
            puestoNombre,
            ocupado: false,
            foto: this.getFotoUrl(p?.usuario?.foto || p?.foto)
          };
        });

        this.validarFechaHoraYActualizarOcupacion();
      }
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
    this.fotoPeluqueroSeleccionado =
      pel.foto && pel.foto.trim() !== ''
        ? pel.foto
        : 'assets/img/default-avatar.png';
  }

  getFotoUrl(fotoStr: string | undefined): string {
    if (!fotoStr || fotoStr.trim() === '') {
      return '';
    }
    // Si ya viene con http (por si acaso), lo retornamos igual
    if (fotoStr.startsWith('http')) {
      return fotoStr;
    }
    return `${environment.baseUrl}/uploads/${fotoStr}`;
  }

  getSelectedPeluquero() {
    const id = this.ctrl('peluquero')?.value;
    return this.peluquerosDropdown.find(p => p._id === id);
  }

  validarFechaHoraYActualizarOcupacion(): void {
    let fecha = this.ctrl('fecha')?.value;
    let hora = this.ctrl('hora')?.value;
    let sedeId = this.ctrl('sede')?.value;

    if (!fecha || !hora || !sedeId) {
      this.fechaHoraInvalida = false;
      return;
    }

    const fechaSeleccionada = this.combinarFechaHora(fecha, hora);
    // 🔒 Bloquear horas pasadas del mismo día
    if (this.esHoraPasadaHoy(fecha, hora)) {
      this.fechaHoraInvalida = true;
      return;
    }

    this.reservaService.getCitasPorFechaYHora(sedeId, fechaSeleccionada.toISOString()).subscribe({
      next: res => {
        const citasArray: any[] = Array.isArray(res.data) ? res.data : res;

        const citasActivas = citasArray.filter((c: any) => c.estado !== 'cancelada');

        const idsOcupados = new Set<string>();

        citasActivas.forEach((c: any) => {
          const inicioCita = new Date(c.fecha);
          const duracion = (c.servicios || []).reduce((t: number, sId: string) => {
            const s = this.servicios.find(sv => sv._id === sId);
            return t + (s?.duracion || 30);
          }, 0);
          const fin = new Date(inicioCita.getTime() + duracion * 60000);

          if (fechaSeleccionada < fin && new Date(fechaSeleccionada.getTime() + 60 * 60000) > inicioCita) {
            idsOcupados.add(this.extractId(c.peluquero) || '');
          }
        });

        this.peluquerosDropdown = this.peluquerosDropdown.map(p => ({
          ...p,
          ocupado: idsOcupados.has(p._id)
        }));

        const pelSel = this.ctrl('peluquero')?.value;
        this.fechaHoraInvalida = !!(pelSel && idsOcupados.has(pelSel));
      }
    });
  }

  verDetalleServicio(servicio: any): void {
    this.dialog.open(ServicioCardDialogComponent, {
      width: '600px',
      data: servicio
    });
  }

  reservarCita(): void {

    if (this.reservarForm.invalid || this.fechaHoraInvalida || this.loading) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    // 🔒 ACTIVAR BLOQUEO
    this.loading = true;

    const datos = this.reservarForm.value;
    const fechaBase = this.combinarFechaHora(datos.fecha, datos.hora);

    const clienteId = this.rolUsuario === 'cliente'
      ? this.usuarioLogueado?.clienteId
      : datos.cliente;

    const citaData = {
      cliente: clienteId,
      sede: datos.sede,
      peluquero: datos.peluquero,
      puestoTrabajo: datos.puestoTrabajo,
      servicios: datos.servicios,
      fecha: fechaBase.toISOString(),
      fechaBase: fechaBase.toISOString(),
      hora: datos.hora,
      observacion: datos.observaciones || ''
    };

    this.reservaService.crearCita(citaData).subscribe({

      next: () => {

        this.loading = false; // 🔓 liberar botón

        this.snackBar.open('Cita creada exitosamente', 'Cerrar', { duration: 3000 });

        this.validarFechaHoraYActualizarOcupacion();

        this.cancelarCita();
      },

      error: (err) => {

        this.loading = false; // 🔓 liberar botón si falla

        const mensaje = err.error?.mensaje?.includes('duplicate key')
          ? 'El peluquero ya tiene una cita en esa fecha y hora.'
          : err.error?.mensaje || 'Error al crear cita';

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

  private esHoraPasadaHoy(fecha: Date, hora: string): boolean {

    const hoy = new Date();

    const esHoy =
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate();

    if (!esHoy) return false;

    const [h, m] = hora.split(':').map(Number);

    const horaSeleccionada = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      h,
      m,
      0
    );

    return horaSeleccionada <= hoy;
  }

  private generarHorasDisponibles(): void {

    const fecha = this.ctrl('fecha')?.value;

    if (!fecha) {
      this.horasDisponibles = [];
      return;
    }

    const hoy = new Date();

    const esHoy =
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate();

    const horas: string[] = [];

    for (let h = this.horaApertura; h < this.horaCierre; h++) {

      for (let m = 0; m < 60; m += this.intervaloMinutos) {

        const horaStr =
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        if (esHoy) {

          const ahora = new Date();
          const horaCita = this.combinarFechaHora(fecha, horaStr);

          if (horaCita <= ahora) {
            continue;
          }

        }

        horas.push(horaStr);

      }

    }

    this.horasDisponibles = horas;

  }

  private combinarFechaHora(fecha: any, hora: string): Date {
    try {
      const [h, m] = hora.split(':').map(Number);
      const f = new Date(fecha);
      return new Date(f.getFullYear(), f.getMonth(), f.getDate(), h, m, 0);
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

  onServiciosChange(selectedIds: string[]) {
    this.serviciosArray.setValue(selectedIds);
    this.serviciosArray.markAsTouched();
  }
}