import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PlatformService {

    isMobile(): boolean {
        return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    }

    isCapacitor(): boolean {
        return !!(window as any).Capacitor;
    }

    isBrowser(): boolean {
        return !this.isCapacitor();
    }
}