import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReservaService, ReprogramarCitaPayload } from 'src/app/shared/services/reserva.service';
import { PeluqueroService } from 'src/app/core/services/peluquero.service';
import { SedeService } from 'src/app/core/services/sede.service';
import { AuthService } from 'src/app/auth/auth.service'; 

@Component({
  selector: 'app-cita-update-dialog',
  templateUrl: './cita-update-dialog.component.html',
  styleUrls: ['./cita-update-dialog.component.scss']
})
export class CitaUpdateDialogComponent implements OnInit {

  citaForm!: FormGroup;
  sedes: any[] = [];
  peluqueros: any[] = [];
  puestosTrabajo: any[] = [];
  peluquerosDropdown: any[] = [];
  servicios: any[] = [];

  guardando = false;
  fechaHoraInvalida = false;
  rolUsuario: string = '';

  fechaMinima: Date = new Date();
  horasDisponibles: string[] = [];
  horaApertura = 9;
  horaCierre = 19;
  intervaloMinutos = 30;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CitaUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public cita: any,
    private reservaService: ReservaService,
    private peluqueroService: PeluqueroService,
    private sedeService: SedeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.rolUsuario = this.authService.obtenerRol();

    this.initForm();
    this.cargarSedes();
    this.cargarServicios();

    if (this.rolUsuario !== 'cliente' && this.cita?.sede?._id) {
      this.onSedeChange(this.cita.sede._id, true);
    }

    this.generarHorasDisponibles();

    this.ctrl('fecha')?.valueChanges.subscribe(() => {
      this.generarHorasDisponibles();
      this.validarFechaHoraYActualizarOcupacion();
    });

    this.ctrl('hora')?.valueChanges.subscribe(() => {
      this.validarFechaHoraYActualizarOcupacion();
    });
  }

  private ctrl(name: string): AbstractControl | null {
    return this.citaForm.get(name);
  }

  get serviciosArray(): FormArray {
    return this.citaForm.get('servicios') as FormArray;
  }

  get serviciosFormControls(): FormControl[] {
    return this.serviciosArray.controls as FormControl[];
  }

  private initForm(): void {
    const fechaObj = new Date(this.cita?.fecha || new Date());
    
    // Redondear los minutos a 00 o 30 para que coincida con las horas disponibles
    let h = fechaObj.getHours();
    let m = fechaObj.getMinutes();
    if (m < 15) { m = 0; }
    else if (m < 45) { m = 30; }
    else { m = 0; h += 1; }
    if (h >= 24) h = 0;
    
    const horaLocal = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    this.citaForm = this.fb.group({
      fecha: [fechaObj, Validators.required],
      hora: [horaLocal, Validators.required],
      sede: new FormControl({ value: this.cita?.sede?._id || null, disabled: true }),
      peluquero: new FormControl({ value: this.cita?.peluquero?._id || null, disabled: true }),
      puestoTrabajoId: new FormControl({ value: this.cita?.puestoTrabajo?._id || null, disabled: true }),
      observaciones: new FormControl({ value: this.cita?.observacion || '', disabled: this.rolUsuario !== 'cliente' }),
      servicios: this.fb.array([]) 
    });
  }

  cargarSedes() {
    this.sedeService.obtenerSedes().subscribe({
      next: (res: any) => this.sedes = res || [],
      error: () => {}
    });
  }

  cargarServicios() {
    this.reservaService.getServicios().subscribe({
      next: (res: any) => {
        this.servicios = res || [];
        const controls = this.servicios.map(s => {
          const selected = this.cita?.servicios?.some((cs: any) => cs._id === s._id) || false;
          const canEdit = this.esEditable() && this.rolUsuario !== 'cliente';
          return new FormControl({ value: selected, disabled: !canEdit });
        });
        this.citaForm.setControl('servicios', new FormArray(controls));
      },
      error: () => {}
    });
  }

  onSedeChange(sedeId: string, preserveSelection = false) {
    if (!sedeId || this.rolUsuario === 'cliente') return;

    this.peluqueroService.getBySede(sedeId).subscribe({
      next: (res: any) => {
        const peluqueros: any[] = Array.isArray(res?.data) ? res.data : [];
        this.peluqueros = peluqueros;

        this.peluquerosDropdown = peluqueros.map((p: any) => ({
          _id: p._id,
          nombre: p.usuario?.nombre || p.nombre || 'Sin nombre',
          puestoTrabajo: p.puestoTrabajo
        }));

        if (preserveSelection) {
          if (this.cita?.peluquero?._id) {
            this.citaForm.patchValue({ peluquero: this.cita.peluquero._id });
            this.onPeluqueroChange(this.cita.peluquero._id);
          }
          if (this.cita?.puestoTrabajo?._id) {
            this.citaForm.patchValue({ puestoTrabajoId: this.cita.puestoTrabajo._id });
          }
        }
      },
      error: () => {}
    });
  }

  onPeluqueroChange(peluqueroId: string) {
    const peluquero = this.peluqueros.find(p => p._id === peluqueroId);
    if (peluquero?.puestoTrabajo) {
      this.puestosTrabajo = [peluquero.puestoTrabajo];
      this.citaForm.patchValue({ puestoTrabajoId: peluquero.puestoTrabajo._id });
    } else {
      this.puestosTrabajo = [];
      this.citaForm.patchValue({ puestoTrabajoId: null });
    }
    this.validarFechaHoraYActualizarOcupacion();
  }

  esEditable(): boolean {
    const fechaCita = new Date(this.cita?.fecha);
    const now = new Date();
    return this.cita?.estado === 'pendiente' && (fechaCita.getTime() - now.getTime()) >= 3600000;
  }

  validarFechaHoraYActualizarOcupacion(): void {
    let fecha = this.ctrl('fecha')?.value;
    let hora = this.ctrl('hora')?.value;
    let sedeId = this.citaForm.getRawValue().sede;

    if (!fecha || !hora || !sedeId) {
      this.fechaHoraInvalida = false;
      return;
    }

    const fechaSeleccionada = this.combinarFechaHora(fecha, hora);
    // 🔒 Bloquear horas pasadas del mismo día (solo si se está editando una cita futura)
    if (this.esEditable() && this.esHoraPasadaHoy(fecha, hora)) {
      this.fechaHoraInvalida = true;
      return;
    }

    this.reservaService.getCitasPorFechaYHora(sedeId, fechaSeleccionada.toISOString()).subscribe({
      next: (res: any) => {
        const citasArray: any[] = Array.isArray(res.data) ? res.data : res;

        // Skip the current cita being edited
        const citasActivas = citasArray.filter((c: any) => c.estado !== 'cancelada' && c._id !== this.cita?._id);

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

        if (this.rolUsuario !== 'cliente') {
          this.peluquerosDropdown = this.peluqueros.map(p => ({
            _id: p._id,
            nombre: p.nombre || p.usuario?.nombre || 'Sin nombre',
            puestoTrabajo: p.puestoTrabajo,
            ocupado: idsOcupados.has(p._id)
          }));
        }

        const pelSel = this.citaForm.getRawValue().peluquero;
        this.fechaHoraInvalida = !!(pelSel && idsOcupados.has(pelSel));
      },
      error: () => {}
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  guardar() {
    if (this.citaForm.invalid || this.fechaHoraInvalida || !this.esEditable()) {
      return;
    }

    this.guardando = true;
    const rawValues = this.citaForm.getRawValue();
    const fechaBase = this.combinarFechaHora(rawValues.fecha, rawValues.hora);
    const fechaIso = fechaBase.toISOString();
    const hora = rawValues.hora;

    // Obtener servicios seleccionados
    const serviciosSeleccionados = this.servicios
      .filter((_, i) => rawValues.servicios[i])
      .map(s => s._id);

    let request$;
    if (this.rolUsuario === 'cliente') {
      const payload: ReprogramarCitaPayload = {
        fecha: fechaIso,
        observacion: rawValues.observaciones || ''
      };
      request$ = this.reservaService.reprogramarCita(this.cita._id, payload);
    } else {
      request$ = this.reservaService.actualizarCita(
        this.cita._id,
        fechaIso,
        hora,
        rawValues.observaciones || '',
        serviciosSeleccionados
      );
    }

    request$.subscribe({
      next: updated => this.dialogRef.close(updated),
      error: () => this.guardando = false,
      complete: () => this.guardando = false
    });
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
        const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

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

  compareById(a: any, b: any): boolean {
    return a === b || (a && b && a === b);
  }

}
