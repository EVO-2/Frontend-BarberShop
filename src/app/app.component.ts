import { Component } from '@angular/core';
import { PusherService } from './services/pusher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Frontend-BarberShop';

  constructor(private pusherService: PusherService) {
    // El servicio de Pusher se inicializa al inyectarlo
  }
}
