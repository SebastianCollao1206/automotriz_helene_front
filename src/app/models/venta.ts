import { ClienteResponse, CrearClienteRequest } from './cliente';

export interface DetalleVentaDTO {
    productoId: number;
    cantidad: number;
    precioUnitario?: number;
}

export interface DetalleVentaResponse {
    id: number;
    productoId: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface VentaResponse {
    id: number;
    fecha: string;
    total: number;
    usuario: string;
    metodoPago: string;
    cliente: ClienteResponse;
    tipoComprobante: TipoComprobante;
    serie: string;
    correlativo: string;
    numeroComprobante: string;
    detalles: DetalleVentaResponse[];
}

export interface CrearVentaRequest {
    metodoPagoId: number;
    tipoComprobante: TipoComprobante;
    cliente: CrearClienteRequest;
    detalles: DetalleVentaDTO[];
}

export enum TipoComprobante {
    BOLETA = 'BOLETA',
    FACTURA = 'FACTURA'
}