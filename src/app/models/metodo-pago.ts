export interface MetodoPagoResponse {
    id: number;
    nombre: string;
    enabled: boolean;
}

export interface CrearMetodoPagoRequest {
    nombre: string;
}

export interface ActualizarMetodoPagoRequest {
    nombre?: string;
    enabled?: boolean;
}