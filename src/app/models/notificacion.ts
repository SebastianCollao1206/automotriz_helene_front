export interface DetalleNotificacionResponse {
  id: number;
  notificacionId: number;
  titulo: string;
  fechaCreacion: string;
  mensaje: string;
  tipoNotificacion: TipoNotificacion;
  entidadTipo: EntidadTipo;
  entidadId: number;
  prioridad: Prioridad;
  estado: EstadoNotificacion;
}

export enum TipoNotificacion {
  PEDIDO_CREADO = 'PEDIDO_CREADO',
  PEDIDO_PROXIMO = 'PEDIDO_PROXIMO',
  PEDIDO_HOY = 'PEDIDO_HOY',
  PEDIDO_RECIBIDO = 'PEDIDO_RECIBIDO',
  PEDIDO_RECIBIDO_PARCIAL = 'PEDIDO_RECIBIDO_PARCIAL',
  STOCK_MINIMO = 'STOCK_MINIMO',
  STOCK_CRITICO = 'STOCK_CRITICO',
  PREDICCION_GENERADA = 'PREDICCION_GENERADA'
}

export enum EntidadTipo {
  PEDIDO = 'PEDIDO',
  PRODUCTO = 'PRODUCTO',
  PREDICCION = 'PREDICCION',
  VENTA = 'VENTA'
}

export enum EstadoNotificacion {
  NO_LEIDA = 'NO_LEIDA',
  LEIDA = 'LEIDA'
}

export enum Prioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA'
}
