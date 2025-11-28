import { EstadoPedido } from "../../models/pedido";
import { EstadoDetallePedido } from "../../models/detalle-pedido";

export const EstadoPedidoLabels: Record<EstadoPedido, string> = {
  [EstadoPedido.PENDIENTE]: 'Pendiente',
  [EstadoPedido.ENTREGA_INCOMPLETA]: 'Entrega Incompleta',
  [EstadoPedido.ENTREGA_COMPLETA]: 'Entrega Completa',
  [EstadoPedido.CANCELADO]: 'Cancelado'
};

export const EstadoDetallePedidoLabels = {
  PENDIENTE: 'Pendiente',
  ENTREGA_INCOMPLETA: 'Entrega Incompleta',
  ENTREGA_COMPLETA: 'Recibido Completo'
};

export const EstadoPedidoBadges: Record<EstadoPedido, string> = {
  [EstadoPedido.PENDIENTE]: 'badge-amarillo',
  [EstadoPedido.ENTREGA_INCOMPLETA]: 'badge-azul',
  [EstadoPedido.ENTREGA_COMPLETA]: 'badge-verde',
  [EstadoPedido.CANCELADO]: 'badge-rojo'
};

export const EstadoDetallePedidoBadges = {
  PENDIENTE: 'badge-amarillo',
  ENTREGA_INCOMPLETA: 'badge-azul',
  ENTREGA_COMPLETA: 'badge-verde'
};