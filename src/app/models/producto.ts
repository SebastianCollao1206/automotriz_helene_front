export interface ProductoResponse {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string;
    cantidadTamanio: number;
    stock: number;
    precioVenta: number;
    stockMinimo: number;
    descuento: number;
    enabled: boolean;
    categoria: string;
    marca: string;
    unidadMedida: string;
    tipoProducto: string;
}

export interface CrearProductoRequest {
    nombre: string;
    descripcion: string;
    cantidadTamanio: number;
    precioVenta: number;
    stockMinimo: number;
    stock?: number;
    descuento?: number;
    categoriaId: number;
    marcaId: number;
    unidadMedidaId: number;
    tipoProductoId: number;
}

export interface ActualizarProductoRequest {
    nombre?: string;
    descripcion?: string;
    cantidadTamanio?: number;
    precioVenta?: number;
    stockMinimo?: number;
    stock?: number;
    descuento?: number;
    enabled?: boolean;
    categoriaId?: number;
    marcaId?: number;
    unidadMedidaId?: number;
    tipoProductoId?: number;
}