import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PagoService } from 'src/app/shared/services/pago.service';

@Component({
  selector: 'app-pago-dialog',
  templateUrl: './pago-dialog.component.html',
  styleUrls: ['./pago-dialog.component.scss']
})
export class PagoDialogComponent {
  pagoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private pagoService: PagoService,
    public dialogRef: MatDialogRef<PagoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const totalServicios = data.cita?.servicios?.reduce((acc: number, s: any) => acc + (s.precio || 0), 0) || 0;
    
    this.pagoForm = this.fb.group({
      monto: [totalServicios, [Validators.required, Validators.min(0)]],
      metodo: ['efectivo', Validators.required],
      observaciones: ['']
    });
  }

  pagar(): void {
    if (this.data.cita.estado === 'cancelada') {
      alert('No se puede pagar una cita cancelada');
      return;
    }

    if (this.pagoForm.invalid) return;

    const pagoData = { ...this.pagoForm.value, cita: this.data.cita._id };
    this.pagoService.crearPago(pagoData).subscribe({
      next: (resp) => this.dialogRef.close({ pagado: true, pago: resp.pago }),
      error: (err) => console.error('Error al pagar:', err)
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
