export interface UnidadMedidaResponse {
  id: number;
  nombre: string;
  enabled: boolean;
}

export interface CrearUnidadMedidaRequest {
  nombre: string;
}

export interface ActualizarUnidadMedidaRequest {
  nombre?: string;
  enabled?: boolean;
}