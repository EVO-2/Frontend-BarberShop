import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ReservaService } from 'src/app/shared/services/reserva.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  clientes: any[] = [];
  sedes: any[] = [];
  servicios: any[] = [];

  peluquerosAll: any[] = [];
  puestos: any[] = [];
  peluquerosFiltrados: any[] = [];
  peluquerosDropdown: PeluqueroDropdownItem[] = [];

  fechaHoraInvalida = false;
  loading = false;

  puestoSeleccionado: { _id: string; nombre: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarDatos();

    this.ctrl('fecha')?.valueChanges.subscribe(() => this.validarFechaHoraYActualizarOcupacion());
    this.ctrl('hora')?.valueChanges.subscribe(() => this.validarFechaHoraYActualizarOcupacion());
    this.ctrl('sede')?.valueChanges.subscribe(val => this.onSedeChange(val));
  }

  private initForm(): void {
    this.reservarForm = this.fb.group({
      cliente: ['', Validators.required],
      sede: ['', Validators.required],
      peluquero: ['', Validators.required],
      puestoTrabajo: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      servicios: this.fb.array([], Validators.required),
      observaciones: ['']
    });
  }

  get serviciosArray(): FormArray {
    return this.reservarForm.get('servicios') as FormArray;
  }

  private ctrl(name: string): AbstractControl | null {
    return this.reservarForm.get(name);
  }

  private cargarDatos(): void {
    this.reservaService.getClientes().subscribe({
      next: res => {
        console.log('[ReservarCita] getClientes response:', res);
        this.clientes = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      },
      error: err => console.error('[ReservarCita] getClientes error:', err)
    });

    this.reservaService.getSedes().subscribe({
      next: res => {
        console.log('[ReservarCita] getSedes response:', res);
        this.sedes = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      },
      error: err => console.error('[ReservarCita] getSedes error:', err)
    });

    this.reservaService.getServicios().subscribe({
      next: res => {
        console.log('[ReservarCita] getServicios response:', res);
        this.servicios = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      },
      error: err => console.error('[ReservarCita] getServicios error:', err)
    });

    this.reservaService.getPeluqueros().subscribe({
      next: res => {
        console.log('[ReservarCita] getPeluqueros response:', res);
        const pelArray = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.peluquerosAll = pelArray.map((p: any) => ({
          ...p,
          __nombreCalc: this.getNombrePeluquero(p)
        }));
      },
      error: err => console.error('[ReservarCita] getPeluqueros error:', err)
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
        console.log('[ReservarCita] getPuestosPorSede response:', res);
        const puestosArray = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.puestos = puestosArray;

        this.peluquerosFiltrados = (this.peluquerosAll || []).filter(p => {
          const sedePel = this.extractId(p?.sede);
          const activo = p?.estado !== false && p?.usuario?.estado !== false;
          return activo && sedePel === sedeId;
        });

        this.peluquerosDropdown = this.peluquerosFiltrados.map(p => {
          const puestoId = this.extractId(p?.puestoTrabajo);
          const puestoNombre =
            typeof p?.puestoTrabajo === 'object' && p?.puestoTrabajo?.nombre
              ? p.puestoTrabajo.nombre
              : (this.puestos.find(pt => pt?._id === puestoId)?.nombre || 'Sin puesto');
          return {
            _id: p._id,
            nombre: p.__nombreCalc,
            puestoId: puestoId || '',
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
      console.warn('[ReservarCita] onPeluqueroChange: peluquero no encontrado:', peluqueroId);
      this.ctrl('puestoTrabajo')?.setValue('');
      this.puestoSeleccionado = null;
      return;
    }

    this.ctrl('puestoTrabajo')?.setValue(pel.puestoId);
    this.puestoSeleccionado = {
      _id: pel.puestoId,
      nombre: pel.puestoNombre
    };
  }

  validarFechaHoraYActualizarOcupacion(): void {
    const fecha = this.ctrl('fecha')?.value;
    const hora = this.ctrl('hora')?.value;
    const sedeId = this.ctrl('sede')?.value;

    console.log('[ReservarCita] validarFechaHoraYActualizarOcupacion', { fecha, hora, sedeId });

    if (!sedeId || !fecha || !hora) {
      this.fechaHoraInvalida = false;
      this.peluquerosDropdown = (this.peluquerosDropdown || []).map(p => ({ ...p, ocupado: false }));
      return;
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
      this.ctrl('hora')?.setErrors({ pattern: true });
      return;
    }

    const fechaISO = this.toISODate(fecha);
    const [horaStr, minStr] = hora.split(':');
    const fechaSeleccionada = new Date(fechaISO);
    fechaSeleccionada.setHours(parseInt(horaStr, 10), parseInt(minStr, 10), 0, 0);

    this.reservaService.getCitasPorFechaYHora(sedeId, fechaISO).subscribe({
      next: res => {
        console.log('[ReservarCita] getCitasPorFechaYHora response:', res);
        const citasArray: any[] = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

        // Solo citas activas (pendientes o completadas)
        const citasActivas = citasArray.filter(c => c.estado !== 'cancelada');

        const idsOcupados = new Set<string>();

        citasActivas.forEach((c: any) => {
          const inicioCita = new Date(c.fecha);
          // Calcular duración real de la cita según servicios
          const duracionCita: number = (c.servicios || []).reduce((t: number, sId: string) => {
            const servicio = this.servicios.find(s => s._id === sId);
            return t + (servicio?.duracion || 30); // 30 min por defecto si no hay duración
          }, 0);
          const finCita = new Date(inicioCita.getTime() + duracionCita * 60 * 1000);

          // Si la fecha seleccionada se solapa con la cita
          if (fechaSeleccionada < finCita && new Date(fechaSeleccionada.getTime() + 60*60*1000) > inicioCita) {
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


  toggleServicio(servicioId: string, event: any): void {
    if (event?.checked) {
      this.serviciosArray.push(this.fb.control(servicioId));
    } else {
      const idx = this.serviciosArray.controls.findIndex(c => c.value === servicioId);
      if (idx >= 0) this.serviciosArray.removeAt(idx);
    }
  }

  reservarCita() {
    if (this.reservarForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      console.warn('[ReservarCita] reservarCita: formulario inválido', this.reservarForm.value);
      return;
    }

    const { fecha, hora, sede, cliente, peluquero, puestoTrabajo, servicios } = this.reservarForm.value;
    console.log('[ReservarCita] reservarCita datos del formulario:', this.reservarForm.value);

    // Validar fecha
    const fechaBase = new Date(fecha);
    if (isNaN(fechaBase.getTime())) {
      this.snackBar.open('❌ Fecha inválida', 'Cerrar', { duration: 3000 });
      console.error('[ReservarCita] reservarCita: fecha inválida', fecha);
      return;
    }

    const [horaStr, minStr] = hora.split(':');
    fechaBase.setHours(parseInt(horaStr, 10), parseInt(minStr, 10), 0, 0);

    // Calcular duración total de la cita según los servicios
    const duracionTotal: number = (servicios as string[]).reduce((total: number, sId: string) => {
      const servicio = this.servicios.find(s => s._id === sId);
      return total + (servicio?.duracion || 30);
    }, 0);

    const fechaFin = new Date(fechaBase.getTime() + duracionTotal * 60 * 1000);

    // Verificar solapamiento con citas existentes
    this.reservaService.getCitasPorFechaYHora(sede, this.toISODate(fechaBase)).subscribe({
      next: res => {
        const citasArray: any[] = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        
        const conflicto = citasArray.some((c: any) => {
          if (this.extractId(c?.peluquero) !== peluquero) return false;
          const inicioCita = new Date(c.fecha);
          const duracionCita: number = (c.servicios || []).reduce((t: number, sId: string) => {
            const servicio = this.servicios.find(s => s._id === sId);
            return t + (servicio?.duracion || 30);
          }, 0);
          const finCita = new Date(inicioCita.getTime() + duracionCita * 60 * 1000);
          return fechaBase < finCita && fechaFin > inicioCita; // si se solapan
        });

        if (conflicto) {
          this.snackBar.open('❌ El peluquero ya tiene otra cita que se cruza con este horario', 'Cerrar', { duration: 4000 });
          console.warn('[ReservarCita] conflicto de horarios', { peluquero, fecha, hora });
          return;
        }

        // Si no hay conflicto, se crea la cita
        const citaData = {
          cliente: cliente || '',
          sede: sede || '',
          peluquero: peluquero || '',
          puestoTrabajo: puestoTrabajo || '',
          servicios: servicios || [],
          fecha: fechaBase.toISOString(),
          fechaBase: fechaBase.toISOString(),
          hora: hora || ''
        };

        console.log('[ReservarCita] citaData a enviar:', citaData);

        this.reservaService.crearCita(citaData).subscribe({
          next: res => {
            console.log('[ReservarCita] crearCita response:', res);
            this.snackBar.open('✅ Cita creada exitosamente', 'Cerrar', { duration: 3000 });
            this.cancelarCita();
          },
          error: err => {
            console.error('[ReservarCita] crearCita error:', err);
            const mensajeError = err.error?.mensaje?.includes('duplicate key')
              ? '❌ El peluquero ya tiene una cita en esa fecha y hora.'
              : err.error?.mensaje || '❌ Error al crear cita';
            this.snackBar.open(mensajeError, 'Cerrar', { duration: 4000 });
          }
        });
      },
      error: err => console.error('[ReservarCita] getCitasPorFechaYHora error:', err)
    });
  }


  cancelarCita(): void {
    console.log('[ReservarCita] cancelarCita');
    this.reservarForm.reset();
    this.peluquerosDropdown = [];
    this.peluquerosFiltrados = [];
    this.puestos = [];
    this.fechaHoraInvalida = false;
    this.puestoSeleccionado = null;
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
    try {
      const date = new Date(d);
      return date.toISOString().split('T')[0];
    } catch {
      console.error('[ReservarCita] toISODate error con valor:', d);
      return '';
    }
  }
}
