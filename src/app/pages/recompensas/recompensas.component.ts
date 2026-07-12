import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-recompensas',
  templateUrl: './recompensas.component.html',
  styleUrls: ['./recompensas.component.scss']
})
export class RecompensasComponent implements OnInit {
  visitasAcumuladas: number = 0;
  visitasParaPremio: number = 10;
  descuentoBienvenidaUsado: boolean = false;
  codigoReferidoPropio: string = '';
  cuponesActivos: any[] = [];
  cargando: boolean = true;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.obtenerRecompensas();
  }

  obtenerRecompensas(): void {
    this.http.get<any>(`${environment.apiUrl}/auth/mis-recompensas`).subscribe({
      next: (res) => {
        this.visitasAcumuladas = res.visitasAcumuladas;
        this.descuentoBienvenidaUsado = res.descuentoBienvenidaUsado;
        this.codigoReferidoPropio = res.codigoReferidoPropio;
        this.cuponesActivos = res.cuponesActivos || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener recompensas', err);
        this.cargando = false;
      }
    });
  }

  copiarCodigo(): void {
    if (this.codigoReferidoPropio) {
      this.clipboard.copy(this.codigoReferidoPropio);
      this.snackBar.open('¡Código copiado al portapapeles!', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    }
  }

  compartirWhatsApp(): void {
    if (this.codigoReferidoPropio) {
      const mensaje = `¡Hola! Descarga la app de la barbería y usa mi código de invitación ${this.codigoReferidoPropio} al registrarte para obtener beneficios exclusivos.`;
      const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
  }

  get progresoVisitas(): number {
    return (this.visitasAcumuladas / this.visitasParaPremio) * 100;
  }
}
