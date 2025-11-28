export interface PrediccionResponse {
  id: number;
  fechaGeneracion: string;
  fechaInicioPeriodo: string;
  fechaFinPeriodo: string;
  totalProductosAnalizados: number;
  totalProductosUrgentes: number;
  porcentajePrecision: number | null;
  productos: DetallePrediccionResponse[];
}

export interface DetallePrediccionResponse {
  id: number;
  idProducto: number;
  nombreProducto: string;
  categoria: string;
  stockActual: number;
  stockPredicho: number;
  stockRecomendado: number;
  cantidadAComprar: number;
  accion: AccionPrediccion;
  prediccionMensual: PrediccionMensualResponse[];
}

export interface PrediccionMensualResponse {
  mes: string;
  anio: number;
  cantidadPredicha: number;
}

export interface GraficoProductoResponse {
  idProducto: number;
  nombreProducto: string;
  datosHistoricos: DatoGrafico[];
  datosPrediccion: DatoGrafico[];
}

export interface GraficoGeneralResponse {
  datosHistoricos: DatoGrafico[];
  datosPrediccion: DatoGrafico[];
  totalProductosAnalizados: number;
}

export interface DatoGrafico {
  mes: string;
  cantidad: number;
  tipo: 'real' | 'prediccion';
}

export enum AccionPrediccion {
  PEDIDO_URGENTE = 'pedido_urgente',
  REPONER_PRONTO = 'reponer_pronto',
  MONITOREAR = 'monitorear',
  STOCK_SUFICIENTE = 'stock_suficiente',
  SIN_REGISTROS = 'sin_registros'
}