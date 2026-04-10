import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PlatformService } from './platform.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private baseUrl: string;

    constructor(private platform: PlatformService) {

        if (!environment.production) {

            // 🔥 DESARROLLO
            if (this.platform.isCapacitor()) {
                this.baseUrl = 'http://192.168.1.17:3000/api';
            } else {
                this.baseUrl = 'http://localhost:3000/api';
            }

        } else {
            // 🚀 PRODUCCIÓN
            this.baseUrl = environment.apiUrl;
        }

        //console.log('🌐 API BASE URL:', this.baseUrl);
    }

    get url() {
        return this.baseUrl;
    }
}