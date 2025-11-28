export interface DetallePedidoResponse {
  id: number;
  pedidoId: number;
  producto: string;
  cantidad: number;
  precioCompraUnitario: number;
  subtotal: number;
  estado: EstadoDetallePedido;
  fechaRecibido?: string;
  cantidadRecibida?: number;
  usuarioRecibio?: string;
}

export interface CrearDetallePedidoRequest {
  productoId: number;
  cantidad: number;
  precioCompraUnitario: number;
}

export enum EstadoDetallePedido {
  PENDIENTE = 'PENDIENTE',
  ENTREGA_INCOMPLETA = 'ENTREGA_INCOMPLETA',
  ENTREGA_COMPLETA = 'ENTREGA_COMPLETA'
}

export interface RecibirDetalleRequest {
  detalles: DetalleRecepcionItem[];
}

export interface DetalleRecepcionItem {
  detalleId: number;
  cantidadRecibida: number;
}