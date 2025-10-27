export interface TipoProductoResponse {
    id: number;
    nombre: string;
    enabled: boolean;
}

export interface CrearTipoProductoRequest {
    nombre: string;
}

export interface ActualizarTipoProductoRequest {
    nombre?: string;
    enabled?: boolean;
}