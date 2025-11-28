import { AccionPrediccion } from '../../models/prediccion';

export const AccionPrediccionLabels: Record<AccionPrediccion, string> = {
  [AccionPrediccion.PEDIDO_URGENTE]: 'Pedido Urgente',
  [AccionPrediccion.REPONER_PRONTO]: 'Reponer Pronto',
  [AccionPrediccion.MONITOREAR]: 'Monitorear',
  [AccionPrediccion.STOCK_SUFICIENTE]: 'Stock Suficiente',
  [AccionPrediccion.SIN_REGISTROS]: 'Sin Registros'
};

export const AccionPrediccionBadges: Record<AccionPrediccion, string> = {
  [AccionPrediccion.PEDIDO_URGENTE]: 'badge-rojo',
  [AccionPrediccion.REPONER_PRONTO]: 'badge-amarillo',
  [AccionPrediccion.MONITOREAR]: 'badge-azul',
  [AccionPrediccion.STOCK_SUFICIENTE]: 'badge-verde',
  [AccionPrediccion.SIN_REGISTROS]: 'badge-gris'
};

export const AccionPrediccionDescripciones: Record<AccionPrediccion, string> = {
  [AccionPrediccion.PEDIDO_URGENTE]: 'Se requiere realizar un pedido de forma urgente',
  [AccionPrediccion.REPONER_PRONTO]: 'Es necesario reponer el stock próximamente',
  [AccionPrediccion.MONITOREAR]: 'Mantener el producto bajo monitoreo',
  [AccionPrediccion.STOCK_SUFICIENTE]: 'El stock actual es suficiente para el período',
  [AccionPrediccion.SIN_REGISTROS]: 'No hay datos históricos suficientes para análisis'
};

export const AccionPrediccionPrioridad: Record<AccionPrediccion, number> = {
  [AccionPrediccion.PEDIDO_URGENTE]: 5,
  [AccionPrediccion.REPONER_PRONTO]: 4,
  [AccionPrediccion.MONITOREAR]: 3,
  [AccionPrediccion.STOCK_SUFICIENTE]: 2,
  [AccionPrediccion.SIN_REGISTROS]: 1
};

export function obtenerPrioridadAccion(accion: AccionPrediccion): number {
  return AccionPrediccionPrioridad[accion] || 0;
}

export function compararPorPrioridad(a: AccionPrediccion, b: AccionPrediccion): number {
  return obtenerPrioridadAccion(b) - obtenerPrioridadAccion(a);
}