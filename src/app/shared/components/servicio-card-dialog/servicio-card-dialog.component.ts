// src/app/shared/components/servicio-card-dialog/servicio-card-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-servicio-card-dialog',
  templateUrl: './servicio-card-dialog.component.html',
  styleUrls: ['./servicio-card-dialog.component.scss']
})
export class ServicioCardDialogComponent {
  currentIndex = 0;
  images: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<ServicioCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public servicio: any
  ) {
    this.images = Array.isArray(servicio?.imagenes) ? servicio.imagenes : [];
  }

  prev(): void {
    if (!this.images.length) return;
    this.currentIndex = (this.currentIndex + this.images.length - 1) % this.images.length;
  }

  next(): void {
    if (!this.images.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  selectIndex(i: number): void {
    if (!this.images.length) return;
    this.currentIndex = i;
  }

 getImageUrl(img: string): string {
  if (!img) return 'assets/no-image.png';
  return img.startsWith('http')
    ? img
    : `${environment.baseUrl}${img}`;
}

  close(): void {
    this.dialogRef.close();
  }
}
