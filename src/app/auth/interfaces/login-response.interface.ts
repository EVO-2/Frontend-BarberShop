// src/app/auth/interfaces/login-response.interface.ts
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nombre: string;
    rol: string;
  };
}
