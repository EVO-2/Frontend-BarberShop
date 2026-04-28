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
  rol?: string;
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
      this.actualizarPeluquerosCompatibles(val);
    });

    this.ctrl('servicios')?.valueChanges.subscribe(() => {
      const sedeSeleccionada = this.ctrl('sede')?.value;
      if (sedeSeleccionada) {
        this.actualizarPeluquerosCompatibles(sedeSeleccionada);
      }
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
    // Deprecated: Lógica movida a actualizarPeluquerosCompatibles
  }

  private actualizarPeluquerosCompatibles(sedeId: string): void {
    const serviciosSeleccionadosIds = this.ctrl('servicios')?.value || [];

    // Limpiar selects y arrays
    this.ctrl('peluquero')?.setValue('');
    this.ctrl('puestoTrabajo')?.setValue('');
    this.puestos = [];
    this.peluquerosFiltrados = [];
    this.peluquerosDropdown = [];

    if (!sedeId) return;

    // Helper para normalizar roles
    const normalizarRoles = (roles: any): string[] => {
      if (!roles) return [];
      if (!Array.isArray(roles)) roles = [roles];
      return roles
        .map((r: any) =>
          String(r)
            .replace(/[\[\]"]/g, '')
            .toLowerCase()
            .trim()
        )
        .filter((r: string) => r.length > 0);
    };

    // 1. Calcular roles requeridos según servicios seleccionados
    const serviciosSeleccionados = this.servicios.filter(s =>
      serviciosSeleccionadosIds.includes(s._id)
    );

    let rolesRequeridos: string[] = ['barbero', 'manicurista'];

    if (serviciosSeleccionados.length > 0) {
      rolesRequeridos = normalizarRoles(serviciosSeleccionados[0].asignadoA);
      for (let i = 1; i < serviciosSeleccionados.length; i++) {
        const rolesDeServicio = normalizarRoles(serviciosSeleccionados[i].asignadoA);
        rolesRequeridos = rolesRequeridos.filter(r => rolesDeServicio.includes(r));
      }

      // Asegurar que al menos se muestre algo si rolesRequeridos queda vacío
      if (rolesRequeridos.length === 0) {
        rolesRequeridos = Array.from(
          new Set(
            this.peluquerosAll
              .map(p => p?.usuario?.rol?.nombre?.toLowerCase())
              .filter(Boolean)
          )
        );
      }
    }

    // 2. Filtrar peluqueros por sede, rol y estado activo
    this.reservaService.getPuestosPorSede(sedeId).subscribe({
      next: res => {
        this.puestos = Array.isArray(res.data) ? res.data : res;

        this.peluquerosFiltrados = this.peluquerosAll.filter(p => {
          const sedePel = this.extractId(p?.sede);
          const rolPel = (p?.usuario?.rol?.nombre || 'barbero').toLowerCase().trim();
          const activo = p?.estado !== false && p?.usuario?.estado !== false;
          return activo && sedePel === sedeId && rolesRequeridos.includes(rolPel);
        });

        // 3. Mapear peluqueros filtrados al dropdown
        this.peluquerosDropdown = this.peluquerosFiltrados.map(p => {
          const puestoId = this.extractId(p?.puestoTrabajo) || '';
          const puestoNombre =
            typeof p?.puestoTrabajo === 'object'
              ? p.puestoTrabajo?.nombre
              : this.puestos.find(pt => pt?._id === puestoId)?.nombre || 'Sin puesto';

          return {
            _id: p._id,
            nombre: p.__nombreCalc || 'Sin nombre',
            puestoId,
            puestoNombre,
            ocupado: false,
            foto: this.getFotoUrl(p?.usuario?.foto || p?.foto),
            rol: p?.usuario?.rol?.nombre || ''
          } as PeluqueroDropdownItem;
        });

        // 4. Mostrar mensaje si no hay profesional disponible
        if (this.peluquerosDropdown.length === 0 && serviciosSeleccionados.length > 0) {
          const servicioNombres = serviciosSeleccionados.map(s => s.nombre).join(', ');
          this.snackBar.open(
            `⚠️ La sede seleccionada no tiene profesionales disponibles para: ${servicioNombres}. Por favor, elige otra sede o servicio.`,
            'Cerrar',
            { duration: 6000, panelClass: ['snack-error'] }
          );
        }

        this.validarFechaHoraYActualizarOcupacion();
      },
      error: err => {
        console.error('❌ Error al obtener puestos por sede:', err);
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
    if (!fotoStr || fotoStr.trim() === '') return '';
    return fotoStr.startsWith('http')
      ? fotoStr
      : `${environment.baseUrl}/uploads/${fotoStr}`;
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

    const traceId = `CITA-${Date.now()}`;

    console.log(`🟢 [${traceId}] Inicio reservarCita`);

    console.log(`📊 [${traceId}] Estado formulario`, {
      invalid: this.reservarForm.invalid,
      fechaHoraInvalida: this.fechaHoraInvalida,
      loading: this.loading
    });

    if (this.reservarForm.invalid || this.fechaHoraInvalida || this.loading) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const datos = this.reservarForm.value;

    console.log(`📥 [${traceId}] Datos del formulario`, datos);

    const fechaBase = this.combinarFechaHora(datos.fecha, datos.hora);

    console.log(`🕒 [${traceId}] Fecha base generada`, fechaBase);

    console.log(`👤 [${traceId}] Usuario logueado`, this.usuarioLogueado);

    // 🔥 FIX PRINCIPAL: clienteId robusto
    const clienteId =
      this.usuarioLogueado?.cliente ||
      this.usuarioLogueado?.cliente?._id ||
      this.usuarioLogueado?.clienteId ||
      this.usuarioLogueado?._id ||
      this.usuarioLogueado?.id;

    console.log(`🆔 [${traceId}] ClienteId resuelto`, {
      clienteId
    });

    if (!clienteId) {
      console.error(`🚨 [${traceId}] ERROR: clienteId es NULL o undefined`);
      this.snackBar.open('Cliente no válido', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!datos.sede || !datos.peluquero || !datos.puestoTrabajo) {
      this.snackBar.open('Datos de sede o profesional incompletos', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!datos.servicios || datos.servicios.length === 0) {
      this.snackBar.open('Debes seleccionar al menos un servicio', 'Cerrar', { duration: 3000 });
      return;
    }

    if (datos.servicios.length > 1) {
      this.snackBar.open('⚠️ No puedes seleccionar múltiples servicios en la misma cita.', 'Cerrar', {
        duration: 5000,
        panelClass: ['snack-error']
      });
      return;
    }

    this.reservaService.getCitasPorFechaYHora(datos.sede, fechaBase.toISOString()).subscribe({

      next: (res) => {

        const citasArray: any[] = Array.isArray(res.data) ? res.data : res;

        const citasActivas = citasArray.filter((c: any) =>
          c.estado !== 'cancelada' &&
          this.extractId(c.peluquero) === datos.peluquero
        );

        const duracionNueva = (datos.servicios || []).reduce((t: number, sId: string) => {
          const s = this.servicios.find(sv => sv._id === sId);
          return t + (s?.duracion || 30);
        }, 0);

        const inicioNueva = fechaBase;
        const finNueva = new Date(inicioNueva.getTime() + duracionNueva * 60000);

        const conflicto = citasActivas.some((c: any) => {

          const inicioExistente = new Date(c.fecha);

          const duracionExistente = (c.servicios || []).reduce((t: number, sId: string) => {
            const s = this.servicios.find(sv => sv._id === sId);
            return t + (s?.duracion || 30);
          }, 0);

          const finExistente = new Date(inicioExistente.getTime() + duracionExistente * 60000);

          return inicioNueva < finExistente && finNueva > inicioExistente;
        });

        if (conflicto) {
          this.snackBar.open('El profesional ya tiene una cita en ese horario.', 'Cerrar', { duration: 5000 });
          return;
        }

        // 🔥 PAYLOAD FINAL CORREGIDO
        const citaData = {
          cliente: clienteId,
          sede: datos.sede,
          peluquero: datos.peluquero,
          puestoTrabajo: datos.puestoTrabajo,
          servicios: datos.servicios,
          fecha: fechaBase.toISOString(),
          hora: datos.hora,
          observacion: datos.observaciones || ''
        };

        console.log(`📤 [${traceId}] Payload FINAL`, citaData);

        this.loading = true;

        this.reservaService.crearCita(citaData).subscribe({

          next: (resp) => {
            this.loading = false;
            this.snackBar.open('Cita creada exitosamente', 'Cerrar', { duration: 3000 });
            this.cancelarCita();
          },

          error: (err) => {
            this.loading = false;

            console.error(`💥 [${traceId}] ERROR BACKEND`, err);

            const mensaje =
              err.error?.mensaje ||
              err.error?.message ||
              'Error al crear cita';

            this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
          }

        });

      },

      error: (err) => {
        console.error(`💥 [${traceId}] Error validando disponibilidad`, err);
        this.snackBar.open('Error validando disponibilidad', 'Cerrar', { duration: 3000 });
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

  getLabelPeluquero(): string {
    const serviciosSeleccionadosIds = this.ctrl('servicios')?.value || [];
    if (!serviciosSeleccionadosIds.length) return 'Profesional';

    const serviciosSeleccionados = this.servicios.filter(s =>
      serviciosSeleccionadosIds.includes(s._id)
    );

    if (serviciosSeleccionados.length === 1) {
      // Mostrar rol o nombre del servicio
      const roles = serviciosSeleccionados[0].asignadoA;
      return roles && roles.length ? `Profesional (${roles.join(', ')})` : 'Profesional';
    } else {
      return 'Profesionales disponibles';
    }
  }
}