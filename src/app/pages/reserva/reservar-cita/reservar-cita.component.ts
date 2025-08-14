import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ReservaService } from '../../../shared/services/reserva.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { Peluquero } from '../../../shared/models/peluquero.model';
import { Servicio } from '../../../shared/models/servicio.model';
import { Sede } from '../../../shared/models/sede.model';
import { PuestoTrabajo } from '../../../shared/models/puesto-trabajo.model';

interface PeluqueroDropdown {
  _id: string;
  nombre: string;
  ocupado: boolean;
}

@Component({
  selector: 'app-reservar-cita',
  templateUrl: './reservar-cita.component.html',
  styleUrls: ['./reservar-cita.component.scss']
})
export class ReservarCitaComponent implements OnInit {

  reservarForm!: FormGroup;

  clientes: Cliente[] = [];
  peluqueros: Peluquero[] = [];
  peluquerosDisponibles: Peluquero[] = [];
  servicios: Servicio[] = [];
  sedes: Sede[] = [];
  puestos: PuestoTrabajo[] = []; // solo para resolver el puesto asignado (no para asignar)

  peluquerosDropdown: PeluqueroDropdown[] = [];
  fechaHoraInvalida = false;

  loading = false;
  puestoAsignado = ''; // solo display

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarDatosIniciales();

    // Revalidar fecha/hora cuando cambian
    this.reservarForm.get('fecha')?.valueChanges.subscribe(() => {
      this.validarFechaHora();
      this.onFechaOHoraChange(); // recalcula ocupación si ya hay sede
    });
    this.reservarForm.get('hora')?.valueChanges.subscribe(() => {
      this.validarFechaHora();
      this.onFechaOHoraChange();
    });
  }

  private initForm() {
    this.reservarForm = this.fb.group({
      cliente: ['', Validators.required],
      sede: ['', Validators.required],
      peluquero: ['', Validators.required],

      // Guardamos SIEMPRE el ObjectId del puesto (lo rellenamos automático al elegir peluquero)
      puestoTrabajo: ['', Validators.required],

      servicios: this.fb.array([], Validators.required),
      fecha: ['', Validators.required],

      // Evitar entradas inválidas (ej. -9:30)
      hora: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],

      observaciones: ['']
    });
  }

  get serviciosArray(): FormArray {
    return this.reservarForm.get('servicios') as FormArray;
  }

  private ctrl(name: string): AbstractControl | null {
    return this.reservarForm.get(name);
  }

  private cargarDatosIniciales() {
    this.loading = true;

    this.reservaService.getClientes().subscribe({
      next: (cl: Cliente[]) => {
        this.clientes = cl ?? [];
      },
      error: err => console.error('Error al obtener clientes:', err)
    });

    this.reservaService.getPeluqueros().subscribe({
      next: (pb: Peluquero[]) => {
        this.peluqueros = pb ?? [];
      },
      error: err => console.error('Error al obtener peluqueros:', err)
    });

    this.reservaService.getServicios().subscribe({
      next: (sv: Servicio[]) => {
        this.servicios = sv ?? [];
      },
      error: err => console.error('Error al obtener servicios:', err)
    });

    this.reservaService.getSedes().subscribe({
      next: (sd: Sede[]) => {
        this.sedes = sd ?? [];
      },
      error: err => console.error('Error al obtener sedes:', err),
      complete: () => (this.loading = false)
    });
  }

  /**
   * Al cambiar de sede:
   *  - Cargamos puestos de esa sede (solo para poder mostrar el puesto del peluquero elegido).
   *  - Construimos peluquerosDisponibles así:
   *      * Activos (estado === true) y
   *      * (p.sede === sedeId  ||  aparecen asignados a un puesto de esa sede)
   *  - Calculamos ocupación por fecha/hora si ya están elegidas.
   */
  onSedeChange(sedeId: string) {
    // Reset dependientes
    this.peluquerosDisponibles = [];
    this.peluquerosDropdown = [];
    this.puestoAsignado = '';
    this.ctrl('peluquero')?.setValue('');
    this.ctrl('puestoTrabajo')?.setValue('');

    if (!sedeId) {
      this.puestos = [];
      return;
    }

    this.reservaService.getPuestosPorSede(sedeId).subscribe({
      next: (puestos: PuestoTrabajo[]) => {
        this.puestos = puestos ?? [];

        // IDs de peluqueros que aparecen asignados a algún puesto de esta sede
        const barberIdsFromPuestos = new Set<string>(
          (this.puestos || [])
            .map(pt => (pt?.peluquero && typeof pt.peluquero === 'string' ? pt.peluquero : (pt?.peluquero as any)?._id))
            .filter((id): id is string => !!id)
        );

        // Filtrar peluqueros activos que:
        // - tengan p.sede === sedeId (cuando el dato está bien seteado)  O
        // - estén asignados a un puesto de esta sede (para el caso de la sede principal que describiste)
        this.peluquerosDisponibles = (this.peluqueros || []).filter(p => {
          if (!p?.estado) return false;
          const sedeObj = p.sede && typeof p.sede !== 'string' ? (p.sede as Sede) : undefined;
          const pertenecePorSede = (typeof p.sede === 'string' && p.sede === sedeId) || (sedeObj?._id === sedeId);
          const pertenecePorPuesto = barberIdsFromPuestos.has(p._id!);
          return pertenecePorSede || pertenecePorPuesto;
        });

        // Construir dropdown (ocupado se calcula luego si hay fecha/hora)
        this.peluquerosDropdown = (this.peluquerosDisponibles || []).map(p => ({
          _id: p._id!,
          nombre: this.getNombreUsuario(p),
          ocupado: false
        }));

        // Si ya hay fecha/hora, recalcular ocupación
        const fecha = this.ctrl('fecha')?.value;
        const hora = this.ctrl('hora')?.value;
        if (fecha && hora) {
          this.validarOcupacionPeluqueros(sedeId, fecha, hora);
        }
      },
      error: err => {
        console.error('Error al obtener puestos:', err);
        this.puestos = [];
      }
    });
  }

  /**
   * Recalcula ocupación si hay sede/fecha/hora elegidas.
   */
  onFechaOHoraChange() {
    const sedeId = this.ctrl('sede')?.value;
    const fecha = this.ctrl('fecha')?.value;
    const hora = this.ctrl('hora')?.value;

    if (sedeId && fecha && hora && !this.fechaHoraInvalida) {
      this.validarOcupacionPeluqueros(sedeId, fecha, hora);
    } else {
      // si falta algo, todos disponibles (sin bloquear por defecto)
      this.peluquerosDropdown = (this.peluquerosDisponibles || []).map(p => ({
        _id: p._id!,
        nombre: this.getNombreUsuario(p),
        ocupado: false
      }));
    }
  }

  /**
   * Marca "ocupado" SOLO si el peluquero tiene una cita EXACTA en esa fecha+hora,
   * e ignora citas pasadas.
   */
  private validarOcupacionPeluqueros(sedeId: string, fecha: string, hora: string) {
    this.reservaService.getCitasPorFechaYHora(sedeId, fecha).subscribe({
      next: (citas: any[]) => {
        const fechaHoraSeleccionada = this.composeDate(fecha, hora);
        const ahora = new Date();

        this.peluquerosDropdown = (this.peluquerosDisponibles || []).map(p => {
          const citaEnCurso = (citas || []).find(c => {
            const idPeluq = c?.peluquero && typeof c.peluquero === 'object' ? c.peluquero._id : c?.peluquero;
            if (idPeluq !== p._id) return false;
            const fechaC = c?.fecha;
            const horaC = c?.hora;
            if (!fechaC || !horaC) return false;

            const fechaHoraCita = this.composeDate(fechaC, horaC);
            // ignorar citas pasadas
            if (fechaHoraCita.getTime() < ahora.getTime()) return false;

            return fechaHoraCita.getTime() === fechaHoraSeleccionada.getTime();
          });
          return {
            _id: p._id!,
            nombre: this.getNombreUsuario(p),
            ocupado: !!citaEnCurso
          };
        });
      },
      error: err => console.error('Error al validar ocupación:', err)
    });
  }

  /**
   * Al elegir peluquero: resolvemos su puesto asignado (solo display)
   * y guardamos en el form el ObjectId real del puesto (requerido por backend).
   */
  onPeluqueroChange(peluqueroId: string) {
    const peluquero = (this.peluquerosDisponibles || []).find(p => p._id === peluqueroId);

    // Resolver puesto asignado de forma robusta:
    // 1) Si viene populado (objeto)
    // 2) Si viene como string (ObjectId) -> buscar en this.puestos
    // 3) Si no hay campo -> buscar por puesto.peluquero === peluquero._id
    let puestoId: string = '';
    let puestoNombre = 'Sin puesto asignado';

    if (peluquero) {
      const pt = peluquero.puestoTrabajo as any;

      if (pt && typeof pt !== 'string') {
        // caso populado
        puestoId = pt?._id ?? '';
        puestoNombre = pt?.nombre ?? 'Sin puesto asignado';
      } else if (typeof pt === 'string') {
        // caso id string
        const encontrado = (this.puestos || []).find(x => x?._id === pt);
        if (encontrado) {
          puestoId = encontrado._id ?? '';
          puestoNombre = encontrado.nombre ?? 'Sin puesto asignado';
        }
      } else {
        // no tiene campo -> buscar por relación inversa en puestos
        const viaPuesto = (this.puestos || []).find(x => {
          const pel = x?.peluquero;
          const pelId = typeof pel === 'string' ? pel : (pel as any)?._id;
          return pelId === peluquero._id;
        });
        if (viaPuesto) {
          puestoId = viaPuesto._id ?? '';
          puestoNombre = viaPuesto.nombre ?? 'Sin puesto asignado';
        }
      }
    }

    this.puestoAsignado = puestoNombre;
    this.ctrl('puestoTrabajo')?.setValue(puestoId || ''); // form SIEMPRE guarda el ID real (o vacío)

    // Recalcular ocupación si ya hay sede/fecha/hora
    const sedeId = this.ctrl('sede')?.value;
    const fecha = this.ctrl('fecha')?.value;
    const hora = this.ctrl('hora')?.value;
    if (sedeId && fecha && hora && peluquero && !this.fechaHoraInvalida) {
      this.validarOcupacionPeluqueros(sedeId, fecha, hora);
    }
  }

  toggleServicio(servicioId: string | undefined, event: any) {
    if (!servicioId) return;

    if (event.checked) {
      this.serviciosArray.push(this.fb.control(servicioId));
    } else {
      const index = this.serviciosArray.controls.findIndex(ctrl => ctrl.value === servicioId);
      if (index !== -1) this.serviciosArray.removeAt(index);
    }
  }

  submit() {
    // Validación extra: no permitir continuar si fecha/hora inválida
    if (this.fechaHoraInvalida) {
      this.ctrl('fecha')?.markAsTouched();
      this.ctrl('hora')?.markAsTouched();
      return;
    }

    if (this.reservarForm.invalid) {
      this.reservarForm.markAllAsTouched();
      return;
    }

    // Si el peluquero no tiene puesto asignado, no enviamos
    const puestoId: string = this.ctrl('puestoTrabajo')?.value;
    if (!puestoId) {
      console.error('No se puede crear la cita: el peluquero seleccionado no tiene puesto asignado.');
      this.ctrl('puestoTrabajo')?.setErrors({ required: true });
      return;
    }

    const data = this.reservarForm.value;
    this.reservaService.crearCita(data).subscribe({
      next: res => {
        console.log('Cita creada:', res);
        this.reservarForm.reset();
        this.serviciosArray.clear();
        this.puestoAsignado = '';
        this.peluquerosDropdown = [];
        this.peluquerosDisponibles = [];
        this.puestos = [];
        this.fechaHoraInvalida = false;
      },
      error: err => console.error('Error al crear cita:', err)
    });
  }

  cancelarCita() {
    this.reservarForm.reset();
    this.serviciosArray.clear();
    this.puestoAsignado = '';
    this.fechaHoraInvalida = false;
    this.peluquerosDropdown = [];
    this.peluquerosDisponibles = [];
  }

  validarFechaHora() {
    const fecha = this.ctrl('fecha')?.value;
    const hora = this.ctrl('hora')?.value;

    // Si falta algo, no marcamos error de pasado, pero validamos patrón de hora
    if (!fecha || !hora) {
      // si hay hora, validar patrón
      if (hora && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
        this.ctrl('hora')?.setErrors({ pattern: true });
      }
      this.fechaHoraInvalida = false;
      return;
    }

    // Validar patrón de hora
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
      this.ctrl('hora')?.setErrors({ pattern: true });
      this.fechaHoraInvalida = true;
      return;
    }

    const fechaHora = this.composeDate(fecha, hora);
    const ahora = new Date();
    this.fechaHoraInvalida = fechaHora.getTime() < ahora.getTime();
    if (this.fechaHoraInvalida) {
      this.ctrl('fecha')?.setErrors({ past: true });
      this.ctrl('hora')?.setErrors({ past: true });
    } else {
      // limpiar errores 'past' si estaban
      if (this.ctrl('fecha')?.hasError('past')) this.ctrl('fecha')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      if (this.ctrl('hora')?.hasError('past')) this.ctrl('hora')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
  }

  // ===================== helpers =====================

  private getNombreUsuario(p: Peluquero): string {
    const u: any = p?.usuario;
    if (!u) return 'Sin nombre';
    if (typeof u === 'string') return u; // en algunos endpoints el backend devuelve string
    return u?.nombre ?? 'Sin nombre';
    }

  private composeDate(fecha: string | Date, hora: string): Date {
    const base = new Date(fecha);
    const [hh, mm] = (hora || '00:00').split(':').map(n => parseInt(n, 10));
    base.setHours(isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, 0, 0);
    return base;
  }
}
