import { DetallePedidoResponse, CrearDetallePedidoRequest } from "./detalle-pedido";

export interface PedidoResponse {
  id: number;
  fechaPedido: string;
  fechaEntregaEsperada: string;
  estado: EstadoPedido;
  total: number;
  proveedor: string;
  usuario: string;
  mensaje: string;
  detalles: DetallePedidoResponse[];
}

export interface CrearPedidoRequest {
  fechaEntregaEsperada: string;
  proveedorId: number;
  detalles: CrearDetallePedidoRequest[];
}

export interface ActualizarPedidoRequest {
  fechaEntregaEsperada: string;
  proveedorId: number;
  detalles: ActualizarDetallePedidoItemRequest[];
}

export interface ActualizarDetallePedidoItemRequest {
  id?: number; 
  productoId: number;
  cantidad: number;
  precioCompraUnitario: number;
}

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  ENTREGA_INCOMPLETA = 'ENTREGA_INCOMPLETA',
  ENTREGA_COMPLETA = 'ENTREGA_COMPLETA',
  CANCELADO = 'CANCELADO'
}