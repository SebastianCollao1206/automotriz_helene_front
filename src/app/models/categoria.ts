export interface CategoriaResponse {
    id: number;
    nombre: string;
    enabled: boolean;
}

export interface CrearCategoriaRequest {
    nombre: string;
}

export interface ActualizarCategoriaRequest {
    nombre?: string;
    enabled?: boolean;
}