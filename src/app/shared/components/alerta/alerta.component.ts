import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.scss']
})
export class AlertaComponent {
  @Input() tipo: 'exito' | 'error' | 'advertencia' | 'info' = 'info';
  @Input() mensaje: string = '';
}
