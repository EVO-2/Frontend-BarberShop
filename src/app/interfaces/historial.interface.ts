export interface HistorialAcceso {
    _id: string;
    usuario: {
        _id: string;
        nombre: string;
        apellido?: string;
        correo: string;
        rol?: string; // a veces viene populado
    };
    accion: 'LOGIN' | 'LOGOUT' | 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'INTENTO_FALLIDO' | 'LECTURA' | string;
    modulo: string;
    descripcion: string;
    entidadId?: string;
    detalles?: any;
    fecha: Date;
    ip?: string;
    dispositivo?: string;
    exito: boolean;
}

export interface HistorialResponse {
    ok: boolean;
    total: number;
    historial: HistorialAcceso[];
}
