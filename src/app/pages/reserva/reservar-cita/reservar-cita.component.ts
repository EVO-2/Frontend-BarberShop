import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ReservaService } from 'src/app/shared/services/reserva.service';
import { MatSnackBar } from '@angular/material/snack-bar';
//import { CrearCitaPayload } from 'src/app/interfaces/cita.interface'; 

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
    this.reservaService.getClientes().subscribe(res => this.clientes = res || []);
    this.reservaService.getSedes().subscribe(res => this.sedes = res || []);
    this.reservaService.getServicios().subscribe(res => this.servicios = res || []);

    this.reservaService.getPeluqueros().subscribe(res => {
      this.peluquerosAll = (res || []).map((p: any) => ({
        ...p,
        __nombreCalc: this.getNombrePeluquero(p)
      }));
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

    this.reservaService.getPuestosPorSede(sedeId).subscribe(puestos => {
      this.puestos = puestos || [];

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
    this.puestoSeleccionado = {
      _id: pel.puestoId,
      nombre: pel.puestoNombre
    };
  }

  validarFechaHoraYActualizarOcupacion(): void {
    const fecha = this.ctrl('fecha')?.value;
    const hora = this.ctrl('hora')?.value;
    const sedeId = this.ctrl('sede')?.value;

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

    this.reservaService.getCitasPorFechaYHora(sedeId, fechaISO).subscribe(citas => {
      const citasPorHora = (citas || []).filter((c: any) => (c?.hora || '').trim() === hora);
      const idsOcupados = new Set<string>(
        citasPorHora.map((c: any) => this.extractId(c?.peluquero)).filter(Boolean) as string[]
      );

      this.peluquerosDropdown = (this.peluquerosDropdown || []).map(item => ({
        ...item,
        ocupado: idsOcupados.has(item._id)
      }));

      const pelSel = this.ctrl('peluquero')?.value;
      this.fechaHoraInvalida = pelSel && idsOcupados.has(pelSel);
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

  // ===================== reservar cita =====================
  reservarCita() {
    if (this.reservarForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const { fecha, hora, sede, cliente, peluquero, puestoTrabajo, servicios } = this.reservarForm.value;

    if (!fecha || !hora) {
      this.snackBar.open('❌ Falta fecha u hora', 'Cerrar', { duration: 3000 });
      return;
    }

    const fechaBase = new Date(fecha);
    if (isNaN(fechaBase.getTime())) {
      this.snackBar.open('❌ Fecha inválida', 'Cerrar', { duration: 3000 });
      return;
    }

    const [horaStr, minStr] = hora.split(':');
    fechaBase.setHours(parseInt(horaStr, 10), parseInt(minStr, 10), 0, 0);

    const citaData = {
      cliente: cliente || '',
      sede: sede || '',
      peluquero: peluquero || '',      // string obligatorio
      puestoTrabajo: puestoTrabajo || '', // string obligatorio
      servicios: servicios || [],
      fecha: fechaBase.toISOString(),
      fechaBase: fechaBase.toISOString(),
      hora: hora || ''
    };

    console.log('Cita a enviar:', citaData);

    this.reservaService.crearCita(citaData).subscribe({
      next: (res) => {
        this.snackBar.open('✅ Cita creada exitosamente', 'Cerrar', { duration: 3000 });
        this.cancelarCita();
      },
      error: (err) => {
        console.error('Error al crear cita', err);
        this.snackBar.open(err.error?.mensaje || '❌ Error al crear cita', 'Cerrar', { duration: 3000 });
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
      return '';
    }
  }
}
