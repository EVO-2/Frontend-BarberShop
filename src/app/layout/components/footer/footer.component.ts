import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { HorarioDia } from 'src/app/core/services/empresa.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  empresaNombre: string = 'Style Manager';
  empresaLogo: string = 'assets/sede.png';
  direccion: string = 'Calle 7 # 64-24 Apt 101';
  telefono: string = '310 460 6301';
  email: string = 'jhonedward.valencia6218@gmail.com';
  
  // Lista de horarios dinámica por defecto (Lunes - Domingo)
  horarios: HorarioDia[] = [
    { dia: 'lunes', abierto: true, apertura: '09:00', cierre: '18:30' },
    { dia: 'martes', abierto: true, apertura: '09:00', cierre: '18:30' },
    { dia: 'miercoles', abierto: true, apertura: '09:00', cierre: '18:30' },
    { dia: 'jueves', abierto: true, apertura: '09:00', cierre: '18:30' },
    { dia: 'viernes', abierto: true, apertura: '09:00', cierre: '20:00' },
    { dia: 'sabado', abierto: true, apertura: '09:00', cierre: '20:00' },
    { dia: 'domingo', abierto: true, apertura: '10:00', cierre: '14:00' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.empresaNombre = usuario.empresaNombre || 'Style Manager';
        this.empresaLogo = usuario.empresaLogo || 'assets/sede.png';
        
        // Si el empresaId es el objeto completo de la empresa poblado desde el perfil
        if (usuario.empresaId && typeof usuario.empresaId === 'object') {
          const emp = usuario.empresaId;
          this.direccion = emp.direccion || this.direccion;
          this.telefono = emp.telefono || this.telefono;
          this.email = emp.email || this.email;
          
          if (emp.horarios && emp.horarios.length > 0) {
            this.horarios = emp.horarios;
          }
        }
      }
    });
  }

  capitalizar(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Generar lista estilizada y ordenada para el template html
  obtenerHorariosProcesados(): { dia: string, abierto: boolean, rango: string }[] {
    const ordenDias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const sorted = [...this.horarios].sort((a, b) => ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia));
    
    return sorted.map(h => {
      const diaStr = this.capitalizar(h.dia);
      if (!h.abierto) {
        return { dia: diaStr, abierto: false, rango: 'Cerrado' };
      }
      
      const apertura12 = this.formatear12h(h.apertura);
      const cierre12 = this.formatear12h(h.cierre);
      
      return {
        dia: diaStr,
        abierto: true,
        rango: `${apertura12} - ${cierre12}`
      };
    });
  }

  formatear12h(hora24: string): string {
    if (!hora24) return '';
    const partes = hora24.split(':');
    let horas = parseInt(partes[0], 10);
    const minutos = partes[1];
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12; // la hora 0 es 12
    return `${horas}:${minutos} ${ampm}`;
  }
}
