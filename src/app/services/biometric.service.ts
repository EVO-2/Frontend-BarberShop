import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

declare var Fingerprint: any;

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  private storageKey = 'auth_token';
  private storageReady = false;

  constructor() {
    this.init();
  }

  // 🧠 Inicializa Storage de forma segura
  async init() {
    try {
      if (Storage && !this.storageReady) {
        this.storageReady = true;
        console.log('[BIO] Storage inicializado correctamente');
      }
    } catch (error) {
      console.warn('[BIO] Error inicializando Storage', error);
      this.storageReady = false;
    }
  }

  // 🔐 Verifica si la biometría está disponible
  isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof Fingerprint === 'undefined') {
        console.warn('[BIO] Plugin Fingerprint no disponible');
        resolve(false);
        return;
      }

      Fingerprint.isAvailable(
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  // 🔐 Muestra el prompt biométrico
  authenticate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (typeof Fingerprint === 'undefined') {
        console.warn('[BIO] Fingerprint no existe');
        reject(false);
        return;
      }

      Fingerprint.show(
        {
          title: 'Autenticación biométrica',
          subtitle: 'Acceso seguro',
          description: 'Usa tu huella o FaceID',
          fallbackButtonTitle: 'Usar PIN',
          cancelButtonTitle: 'Cancelar',
          disableBackup: false
        },
        () => resolve(true),
        (err: any) => {
          console.error('[BIO] Error biométrico', err);
          reject(false);
        }
      );
    });
  }

  // 🔐 Guardar token
  async saveToken(token: string) {
    if (!this.storageReady) {
      console.warn('[BIO] Storage no disponible - saveToken cancelado');
      return;
    }

    try {
      await Storage['set']({
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
    if (!this.storageReady) {
      console.warn('[BIO] Storage no disponible - getToken cancelado');
      return null;
    }

    try {
      const res = await Storage['get']({ key: this.storageKey });
      return res?.value ?? null;
    } catch (error) {
      console.error('[BIO] Error obteniendo token', error);
      return null;
    }
  }

  // 🔐 Eliminar token
  async clearToken() {
    if (!this.storageReady) {
      console.warn('[BIO] Storage no disponible - clearToken cancelado');
      return;
    }

    try {
      await Storage['remove']({ key: this.storageKey });
      console.log('[BIO] Token eliminado');
    } catch (error) {
      console.error('[BIO] Error eliminando token', error);
    }
  }
}
