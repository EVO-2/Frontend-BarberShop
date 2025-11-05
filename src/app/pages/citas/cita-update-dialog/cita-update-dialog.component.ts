import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
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

    this.citaForm.get('fecha')?.valueChanges.subscribe(() => this.validarDisponibilidad());
  }

  get serviciosArray(): FormArray {
    return this.citaForm.get('servicios') as FormArray;
  }

  get serviciosFormControls(): FormControl[] {
    return this.serviciosArray.controls as FormControl[];
  }

  private initForm(): void {
    const fechaObj = new Date(this.cita?.fecha || new Date());
    const offsetMs = fechaObj.getTimezoneOffset() * 60 * 1000;
    const fechaLocal = new Date(fechaObj.getTime() - offsetMs).toISOString().slice(0, 16);

    this.citaForm = this.fb.group({
      fecha: [fechaLocal, Validators.required],
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
          return new FormControl({ value: selected, disabled: false });
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
    this.validarDisponibilidad();
  }

  esEditable(): boolean {
    const fechaCita = new Date(this.cita?.fecha);
    const now = new Date();
    return this.cita?.estado === 'pendiente' && (fechaCita.getTime() - now.getTime()) >= 3600000;
  }

  validarDisponibilidad() {
    if (this.rolUsuario === 'cliente') return;

    const sedeId = this.citaForm.getRawValue().sede;
    const fechaHora = this.citaForm.value.fecha;
    const peluqueroId = this.citaForm.getRawValue().peluquero;

    if (!sedeId || !fechaHora) return;

    const fechaUtc = new Date(fechaHora).toISOString();
    const fechaInicio = new Date(new Date(fechaUtc).getTime() - 45 * 60 * 1000).toISOString(); 
    const fechaFin = new Date(new Date(fechaUtc).getTime() + 45 * 60 * 1000).toISOString();   

    this.reservaService.getCitasPorRango(sedeId, fechaInicio, fechaFin).subscribe({
      next: (citas: any[]) => {
        const ocupados = new Set((citas || []).filter(c => c._id !== this.cita?._id).map(c => c.peluquero._id));

        this.peluquerosDropdown = this.peluqueros.map(p => ({
          _id: p._id,
          nombre: p.nombre || p.usuario?.nombre || 'Sin nombre',
          puestoTrabajo: p.puestoTrabajo,
          ocupado: ocupados.has(p._id)
        }));

        this.fechaHoraInvalida = peluqueroId && ocupados.has(peluqueroId);
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
    const fechaObj = new Date(rawValues.fecha);
    const fechaIso = fechaObj.toISOString();
    const hora = fechaObj.toISOString().split('T')[1].slice(0, 5);

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
        rawValues.observaciones || ''
      );
    }

    request$.subscribe({
      next: updated => this.dialogRef.close(updated),
      error: () => this.guardando = false,
      complete: () => this.guardando = false
    });
  }

  compareById(a: any, b: any): boolean {
    return a === b || (a && b && a === b);
  }

}
