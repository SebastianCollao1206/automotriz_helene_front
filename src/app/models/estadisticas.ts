export interface RecaudacionPorPeriodoDTO {
    periodo: string;
    total: number;
}

export interface TopMarcaDTO {
    marca: string;
    cantidadVendida: number;
    totalRecaudado: number;
}

export interface TopProductoDTO {
    productoId: number;
    nombreCompleto: string;
    marca: string;
    cantidadVendida: number;
    totalRecaudado: number;
    imagen?: string;
}

export interface EstadisticasDTO {
    totalRecaudado: number;
    numeroVentas: number;
    numeroClientes: number;
    mediaRecaudado: number;
    porcentajeDiferencia: number;
    porEncimaMedia: boolean;
    recaudacionPorPeriodo: RecaudacionPorPeriodoDTO[];
    topMarcas: TopMarcaDTO[];
    topProductos: TopProductoDTO[];
}