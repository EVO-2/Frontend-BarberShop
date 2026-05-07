import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CitaService } from 'src/app/shared/services/cita.service';

@Component({
  selector: 'app-pago-dialog',
  templateUrl: './pago-dialog.component.html',
  styleUrls: ['./pago-dialog.component.scss']
})
export class PagoDialogComponent {

  pagoForm: FormGroup;
  loading = false;
  archivoComprobante: File | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoComprobante = file;
    }
  }

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    public dialogRef: MatDialogRef<PagoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    const totalServicios =
      data.cita?.servicios?.reduce(
        (acc: number, s: any) => acc + (s.precio || 0),
        0
      ) || 0;

    const metodoInicial = data.cita?.pago?.metodo || 'efectivo';
    let observacionesInicial = '';
    
    // Si el pago ya fue reportado, cargar las observaciones que dejó el cliente
    if (data.cita?.pago?.observaciones) {
      observacionesInicial = data.cita.pago.observaciones.replace('[Reporte Cliente]: ', '');
    }

    this.pagoForm = this.fb.group({
      monto: [totalServicios, [Validators.required, Validators.min(1)]],
      metodo: [metodoInicial, Validators.required],
      observaciones: [observacionesInicial]
    });

    if (this.data.userRole === 'cliente') {
      this.pagoForm.get('monto')?.disable();
    }
  }

  pagar(): void {

    const cita = this.data.cita;

    // 🚫 No permitir pagar cancelada
    if (cita.estado === 'cancelada') {
      alert('No se puede pagar una cita cancelada');
      return;
    }

    // 🚫 No permitir pagar no finalizadas
    if (cita.estado === 'pendiente' || cita.estado === 'en_proceso' || cita.estado === 'confirmada') {
      alert('La cita debe estar finalizada para procesar o reportar el pago');
      return;
    }

    // 🚫 No permitir pagar si ya está pagada
    if (cita.estado === 'pagada') {
      alert('Esta cita ya está pagada');
      return;
    }

    if (this.pagoForm.invalid || this.loading) return;

    this.loading = true;

    const { monto, metodo, observaciones } = this.pagoForm.getRawValue();

    if (this.data.userRole === 'cliente') {
      this.citaService.reportarPago(cita._id, metodo, observaciones, this.archivoComprobante || undefined)
        .subscribe({
          next: (citaActualizada) => {
            this.loading = false;
            this.dialogRef.close({
              reportado: true,
              cita: citaActualizada
            });
          },
          error: (err) => {
            this.loading = false;
            console.error('Error al reportar el pago:', err);
            console.error('Backend error:', err?.error);
            alert(err?.error?.mensaje || err?.error?.message || 'Error al reportar el pago');
          }
        });
    } else {
      this.citaService.pagarCita(cita._id, monto, metodo)
        .subscribe({
          next: (citaActualizada) => {
            this.loading = false;
            this.dialogRef.close({
              pagado: true,
              cita: citaActualizada
            });
          },
          error: (err) => {
            this.loading = false;
            console.error('Error al pagar:', err);
            console.error('Backend error:', err?.error);
            alert(err?.error?.mensaje || err?.error?.message || 'Error al procesar el pago');
          }
        });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}