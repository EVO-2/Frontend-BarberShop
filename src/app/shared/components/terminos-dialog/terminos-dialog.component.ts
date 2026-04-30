import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-terminos-dialog',
  templateUrl: './terminos-dialog.component.html',
  styleUrls: ['./terminos-dialog.component.scss']
})
export class TerminosDialogComponent {
  constructor(public dialogRef: MatDialogRef<TerminosDialogComponent>) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
