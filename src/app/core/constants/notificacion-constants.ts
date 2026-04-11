import { TipoNotificacion, Prioridad } from "../../models/notificacion";


export function obtenerDescripcionTipoNotificacion(tipo: TipoNotificacion): string {
  const descripciones: Record<TipoNotificacion, string> = {
    [TipoNotificacion.PEDIDO_CREADO]: 'Nuevo pedido creado',
    [TipoNotificacion.PEDIDO_PROXIMO]: 'Pedido próximo a llegar',
    [TipoNotificacion.PEDIDO_HOY]: 'Pedido llega hoy',
    [TipoNotificacion.PEDIDO_RECIBIDO]: 'Pedido recibido',
    [TipoNotificacion.PEDIDO_RECIBIDO_PARCIAL]: 'Pedido recibido parcialmente',
    [TipoNotificacion.STOCK_MINIMO]: 'Stock mínimo alcanzado',
    [TipoNotificacion.STOCK_CRITICO]: 'Stock crítico',
    [TipoNotificacion.PREDICCION_GENERADA]: 'Predicción generada'
  };
  return descripciones[tipo];
}

export function obtenerIconoNotificacion(tipo: TipoNotificacion): string {
  const iconos: Record<TipoNotificacion, string> = {
    [TipoNotificacion.PEDIDO_CREADO]: 'fa-shopping-cart',
    [TipoNotificacion.PEDIDO_PROXIMO]: 'fa-truck',
    [TipoNotificacion.PEDIDO_HOY]: 'fa-clock',
    [TipoNotificacion.PEDIDO_RECIBIDO]: 'fa-check-circle',
    [TipoNotificacion.PEDIDO_RECIBIDO_PARCIAL]: 'fa-exclamation-circle',
    [TipoNotificacion.STOCK_MINIMO]: 'fa-box',
    [TipoNotificacion.STOCK_CRITICO]: 'fa-exclamation-triangle',
    [TipoNotificacion.PREDICCION_GENERADA]: 'fa-chart-line'
  };
  return iconos[tipo];
}

export function obtenerColorPrioridad(prioridad: Prioridad): string {
  const colores: Record<Prioridad, string> = {
    [Prioridad.BAJA]: 'text-blue-500',
    [Prioridad.MEDIA]: 'text-yellow-500',
    [Prioridad.ALTA]: 'text-orange-500',
    [Prioridad.CRITICA]: 'text-red-500'
  };
  return colores[prioridad];
}