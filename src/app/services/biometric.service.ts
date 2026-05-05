import { Injectable } from '@angular/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  private storageKey = 'auth_token';

  constructor() {
    this.init();
  }

  // 🧠 Inicializa biometría si es necesario
  async init() {
    console.log('[BIO] BiometricService inicializado');
  }

  // 🔐 Verifica si la biometría está disponible
  async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false; // La biometría nativa no opera en la web
    }

    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      console.warn('[BIO] Biometría no disponible en este dispositivo', error);
      return false;
    }
  }

  // 🔐 Muestra el prompt biométrico
  async authenticate(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Usa tu huella o FaceID para acceder',
        title: 'Autenticación biométrica',
        subtitle: 'Acceso seguro',
        description: 'Usa tu biometría para ingresar a la Barbería',
      });
      return true;
    } catch (error) {
      console.error('[BIO] Error biométrico o autenticación cancelada', error);
      return false;
    }
  }

  // 🔐 Guardar token de manera segura
  async saveToken(token: string) {
    try {
      await Preferences.set({
        key: this.storageKey,
        value: token
      });
      console.log('[BIO] Token guardado correctamente');
    } catch (error) {
      console.error('[BIO] Error guardando token', error);
    }
  }

  // 🔐 Obtener token
  async getToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.storageKey });
      return value;
    } catch (error) {
      console.error('[BIO] Error obteniendo token', error);
      return null;
    }
  }

  // 🔐 Eliminar token
  async clearToken() {
    try {
      await Preferences.remove({ key: this.storageKey });
      console.log('[BIO] Token eliminado');
    } catch (error) {
      console.error('[BIO] Error eliminando token', error);
    }
  }
}
