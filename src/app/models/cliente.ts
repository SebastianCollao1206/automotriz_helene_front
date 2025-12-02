export interface ClienteResponse {
    id: number;
    nombre: string;
    dni: string;
    ruc: string;
    direccionFiscal: string;
}

export interface CrearClienteRequest {
    nombre: string;
    dni?: string;
    ruc?: string;
    direccionFiscal?: string;
}