export interface MarcaResponse {
    id: number;
    nombre: string;
    enabled: boolean;
}

export interface CrearMarcaRequest {
    nombre: string;
}

export interface ActualizarMarcaRequest {
    nombre?: string;
    enabled?: boolean;
}