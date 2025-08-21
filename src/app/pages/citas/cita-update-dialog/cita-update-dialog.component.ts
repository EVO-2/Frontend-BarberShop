import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CitaService } from 'src/app/shared/services/cita.service';
import { PeluqueroService } from 'src/app/core/services/peluquero.service';
import { SedeService } from 'src/app/core/services/sede.service';

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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CitaUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public cita: any,
    private citaService: CitaService,
    private peluqueroService: PeluqueroService,
    private sedeService: SedeService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarSedes();
    this.cargarServicios();

    if (this.cita?.sede?._id) this.onSedeChange(this.cita.sede._id);
    if (this.cita?.peluquero?._id) this.onPeluqueroChange(this.cita.peluquero._id);

    this.citaForm.get('fecha')?.valueChanges.subscribe(() => this.validarDisponibilidad());
    this.citaForm.get('peluquero')?.valueChanges.subscribe(() => this.validarDisponibilidad());
  }

  get serviciosArray(): FormArray {
    return this.citaForm.get('servicios') as FormArray;
  }

  get serviciosFormControls(): FormControl[] {
    return this.serviciosArray.controls as FormControl[];
  }

  private initForm(): void {
    const fechaObj = new Date(this.cita.fecha);
    const offsetMs = fechaObj.getTimezoneOffset() * 60 * 1000;
    const fechaLocalObj = new Date(fechaObj.getTime() - offsetMs);
    const fechaLocal = fechaLocalObj.toISOString().slice(0, 16);

    this.citaForm = this.fb.group({
      fecha: [fechaLocal, Validators.required],
      sede: [this.cita.sede?._id || null, Validators.required],
      peluquero: [this.cita.peluquero?._id || null, Validators.required],
      puestoTrabajoId: [this.cita.puestoTrabajo?._id || null, Validators.required],
      observaciones: [this.cita.observaciones || ''],
      servicios: this.fb.array([]) // inicializamos vacío, se llenará después
    });
  }

  cargarSedes() {
    this.sedeService.obtenerSedes().subscribe({
      next: (res: any) => this.sedes = res || [],
      error: (err: any) => console.error('Error al cargar sedes:', err)
    });
  }

  cargarServicios() {
    this.citaService.obtenerServicios().subscribe({
      next: (res: any) => {
        this.servicios = res || [];

        // Inicializar los FormControls para los servicios
        const controls = this.servicios.map(s =>
          new FormControl(this.cita.servicios?.some((cs: any) => cs._id === s._id) || false)
        );
        const formArray = new FormArray(controls);
        this.citaForm.setControl('servicios', formArray);
      },
      error: (err: any) => console.error('Error al cargar servicios:', err)
    });
  }

  onSedeChange(sedeId: string) {
    if (!sedeId) return;
    this.peluqueroService.getBySede(sedeId).subscribe({
      next: (res: any) => {
        this.peluqueros = res || [];
        this.peluquerosDropdown = this.peluqueros.map(p => ({
          _id: p._id,
          nombre: p.nombre || p.usuario?.nombre || 'Sin nombre',
          puestoTrabajo: p.puestoTrabajo
        }));
        this.citaForm.patchValue({ peluquero: null, puestoTrabajoId: null });
        this.puestosTrabajo = [];
        this.validarDisponibilidad();
      },
      error: (err: any) => console.error('Error al cargar peluqueros:', err)
    });
  }

  onPeluqueroChange(peluqueroId: string) {
    const peluquero = this.peluqueros.find(p => p._id === peluqueroId);
    if (peluquero && peluquero.puestoTrabajo) {
      this.puestosTrabajo = [peluquero.puestoTrabajo];
      this.citaForm.patchValue({ puestoTrabajoId: peluquero.puestoTrabajo._id });
    } else {
      this.puestosTrabajo = [];
      this.citaForm.patchValue({ puestoTrabajoId: null });
    }
    this.validarDisponibilidad();
  }

  toggleServicio(index: number, event: any): void {
    const control = this.serviciosFormControls[index];
    if (control) control.setValue(event.checked);
  }

  esEditable(): boolean {
    const fechaCita = new Date(this.cita.fecha);
    const now = new Date();
    return this.cita.estado === 'pendiente' && (fechaCita.getTime() - now.getTime()) >= 3600000; // 1 hora
  }

  validarDisponibilidad() {
    const sedeId = this.citaForm.value.sede;
    const fechaHora = this.citaForm.value.fecha;
    const peluqueroId = this.citaForm.value.peluquero;
    if (!sedeId || !fechaHora) return;

    const fechaUtc = new Date(fechaHora).toISOString();
    const fechaInicio = new Date(new Date(fechaUtc).getTime() - 30 * 60 * 1000).toISOString();
    const fechaFin = new Date(new Date(fechaUtc).getTime() + 30 * 60 * 1000).toISOString();

    this.citaService.getCitasPorRango(sedeId, fechaInicio, fechaFin).subscribe({
      next: (citas: any[]) => {
        const ocupados = new Set(
          (citas || []).filter(c => c._id !== this.cita?._id).map(c => c.peluquero._id)
        );
        this.peluquerosDropdown = this.peluqueros.map(p => ({
          _id: p._id,
          nombre: p.nombre || p.usuario?.nombre || 'Sin nombre',
          puestoTrabajo: p.puestoTrabajo,
          ocupado: ocupados.has(p._id)
        }));
        this.fechaHoraInvalida = peluqueroId && ocupados.has(peluqueroId);
      },
      error: (err: any) => console.error('❌ Error al validar disponibilidad:', err)
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  guardar() {
    if (this.citaForm.invalid || this.fechaHoraInvalida || !this.esEditable()) return;
    this.guardando = true;

    const formValue = this.citaForm.value;
    const serviciosSeleccionados = this.servicios
      .filter((s, i) => formValue.servicios[i])
      .map(s => s._id);

    const payload = {
      sede: formValue.sede,
      peluquero: formValue.peluquero,
      puestoTrabajo: formValue.puestoTrabajoId,
      fecha: new Date(formValue.fecha).toISOString(),
      observaciones: formValue.observaciones,
      servicios: serviciosSeleccionados
    };

    this.citaService.actualizarCita(this.cita._id, payload).subscribe({
      next: updated => this.dialogRef.close(updated),
      error: (err: any) => {
        console.error('❌ Error al actualizar cita:', err);
        this.guardando = false;
      },
      complete: () => this.guardando = false
    });
  }
}
