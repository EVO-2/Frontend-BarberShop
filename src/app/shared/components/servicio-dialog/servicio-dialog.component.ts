import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Servicio } from 'src/app/core/services/servicios.service';
import { ServicioCardDialogComponent } from '../servicio-card-dialog/servicio-card-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-servicio-dialog',
  templateUrl: './servicio-dialog.component.html',
  styleUrls: ['./servicio-dialog.component.scss']
})
export class ServicioDialogComponent implements OnInit {
  form!: FormGroup;
  modoEdicion = false;
  tituloDialogo = 'Crear Nuevo Servicio';

  imagenesSeleccionadas: File[] = [];
  imagenesReemplazadas: { [index: number]: File } = {};
  imagenesExistentes: string[] = [];
  imagenesPreview: string[] = [];
  activeIndex = 0;

  environment = environment;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ServicioDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Servicio> & { modoEdicion?: boolean }
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.detectarModoEdicion();

    if (this.modoEdicion && this.data?.imagenes?.length) {
      this.cargarImagenesExistentes(this.data.imagenes);
    }
  }

  /** ================== FORMULARIO ================== */
  private inicializarFormulario(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      duracion: [0, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(1)]],
      estado: [true]
    });
  }

  /** ================== DETECTAR MODO EDICIÓN ================== */
  private detectarModoEdicion(): void {
    this.modoEdicion = this.data?.modoEdicion === true;
    if (this.modoEdicion && this.data && this.data._id) {
      this.tituloDialogo = 'Editar Servicio';
      this.form.patchValue({
        nombre: this.data.nombre,
        descripcion: this.data.descripcion,
        duracion: this.data.duracion,
        precio: this.data.precio,
        estado: this.data.estado
      });
    }
  }

  /** ================== CARGAR IMÁGENES EXISTENTES ================== */
  private cargarImagenesExistentes(imagenes: string[]): void {
    if (!imagenes?.length) return;

    this.imagenesExistentes = imagenes.map((img: string) => {
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      return `${environment.baseUrl}${img}`;
    });
  }

  /** ================== GUARDAR ================== */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const imagenesExistentesParaEnviar = this.imagenesExistentes.filter((url) =>
      typeof url === 'string' && (url.startsWith('http') || url.startsWith('/'))
    );

    const nuevasImagenesParaEnviar: File[] = [
      ...this.imagenesSeleccionadas,
      ...Object.values(this.imagenesReemplazadas)
    ];

    const resultado = {
      ...this.form.value,
      imagenesExistentes: imagenesExistentesParaEnviar,
      nuevasImagenes: nuevasImagenesParaEnviar
    };

    this.dialogRef.close(resultado);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  /** ================== SELECCIONAR NUEVAS IMÁGENES ================== */
  onSeleccionarImagenes(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const archivos = Array.from(input.files);
    const totalActual = this.imagenesExistentes.length + this.imagenesSeleccionadas.length;
    const disponibles = 3 - totalActual;

    if (disponibles <= 0) {
      input.value = '';
      return;
    }

    const archivosPermitidos = archivos.slice(0, disponibles);

    archivosPermitidos.forEach((archivo) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenesSeleccionadas.push(archivo);
        this.imagenesPreview.push(reader.result as string);
      };
      reader.readAsDataURL(archivo);
    });

    input.value = '';
  }

  /** ================== ELIMINAR IMAGEN EXISTENTE ================== */
  eliminarImagenExistente(index: number): void {
    this.imagenesExistentes.splice(index, 1);

    if (this.imagenesReemplazadas.hasOwnProperty(index)) {
      delete this.imagenesReemplazadas[index];
    }

    const nuevoMap: { [index: number]: File } = {};
    const keys = Object.keys(this.imagenesReemplazadas)
      .map(k => parseInt(k, 10))
      .sort((a, b) => a - b);

    keys.forEach((oldIndex) => {
      const file = this.imagenesReemplazadas[oldIndex];
      const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
      nuevoMap[newIndex] = file;
    });

    this.imagenesReemplazadas = nuevoMap;
  }

  /** ================== ELIMINAR IMAGEN NUEVA ================== */
  eliminarImagenPreview(index: number): void {
    this.imagenesPreview.splice(index, 1);
    this.imagenesSeleccionadas.splice(index, 1);
  }

  /** ================== REEMPLAZAR IMAGEN EXISTENTE ================== */
  onReemplazarImagenExistente(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imagenesExistentes[index] = reader.result as string;
      this.imagenesReemplazadas[index] = file;
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  /** ================== REEMPLAZAR IMAGEN NUEVA ================== */
  onReemplazarImagenPreview(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imagenesPreview[index] = reader.result as string;
      this.imagenesSeleccionadas[index] = file;
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  /** ================== MOSTRAR DETALLES (CARRUSEL) ================== */
  abrirDetalles(servicio: Servicio): void {
    const data = {
      _id: servicio._id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion: servicio.duracion,
      precio: servicio.precio,
      imagenes: servicio.imagenes,
      estado: servicio.estado
    };

    this.dialog.open(ServicioCardDialogComponent, {
      width: '900px',
      data
    });
  }
}
