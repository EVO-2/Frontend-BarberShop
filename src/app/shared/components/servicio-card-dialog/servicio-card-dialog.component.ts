import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

export interface ServicioDialogData {
  _id?: string;
  nombre?: string;
  descripcion?: string;
  duracion?: number;
  precio?: number;
  imagenes?: string[];
  estado?: boolean;
}

@Component({
  selector: 'app-servicio-card-dialog',
  templateUrl: './servicio-card-dialog.component.html',
  styleUrls: ['./servicio-card-dialog.component.scss']
})
export class ServicioCardDialogComponent implements OnInit {
  currentIndex = 0;
  images: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<ServicioCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public servicio: ServicioDialogData
  ) {}

  ngOnInit(): void {
    this.images = Array.isArray(this.servicio.imagenes)
      ? this.servicio.imagenes
      : [];
  }

  prev(): void {
    if (!this.images?.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  next(): void {
    if (!this.images?.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  selectIndex(i: number): void {
    if (i >= 0 && i < this.images.length) {
      this.currentIndex = i;
    }
  }

  getImageUrl(img?: string | null): string {
    const placeholder = 'assets/no-image.png';
    if (!img) return placeholder;

    const trimmed = img.trim();

    // ✅ Soporte para imágenes base64
    if (trimmed.startsWith('data:image')) return trimmed;

    // ✅ Soporte para URLs completas
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    // ✅ Construir ruta del backend
    const base = environment.baseUrl?.replace(/\/+$/, '') ?? '';
    const ruta = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${base}${ruta}`;
  }

  close(returnImage: boolean = false): void {
    if (returnImage && this.images.length) {
      this.dialogRef.close({ imagenSeleccionada: this.images[this.currentIndex] });
    } else {
      this.dialogRef.close();
    }
  }
}
