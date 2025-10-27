import { Injectable } from '@angular/core';

export interface ConfiguracionPaginacion<T> {
  items: T[];
  itemsPorPagina: number;
  paginaActual?: number;
}

export interface ResultadoPaginacion<T> {
  itemsPaginados: T[];
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  paginasArray: number[];
  tienePaginaAnterior: boolean;
  tienePaginaSiguiente: boolean;
}

@Injectable({
  providedIn: 'root'
})

//IMPLEMENTAR DESPUES
export class Paginacion {
  calcularPaginacion<T>(config: ConfiguracionPaginacion<T>): ResultadoPaginacion<T> {
    const { items, itemsPorPagina, paginaActual = 1 } = config;
    
    const totalItems = items.length;
    const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
    
    let paginaAjustada = paginaActual;
    if (paginaAjustada > totalPaginas && totalPaginas > 0) {
      paginaAjustada = totalPaginas;
    } else if (paginaAjustada < 1) {
      paginaAjustada = 1;
    }
    
    const inicio = (paginaAjustada - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const itemsPaginados = items.slice(inicio, fin);
    
    const paginasArray = Array.from({ length: totalPaginas }, (_, i) => i + 1);
    
    return {
      itemsPaginados,
      paginaActual: paginaAjustada,
      totalPaginas,
      totalItems,
      paginasArray,
      tienePaginaAnterior: paginaAjustada > 1,
      tienePaginaSiguiente: paginaAjustada < totalPaginas
    };
  }

  obtenerPaginaSiguiente(paginaActual: number, totalPaginas: number): number {
    return paginaActual < totalPaginas ? paginaActual + 1 : paginaActual;
  }

  obtenerPaginaAnterior(paginaActual: number): number {
    return paginaActual > 1 ? paginaActual - 1 : paginaActual;
  }

  esPaginaValida(pagina: number, totalPaginas: number): boolean {
    return pagina >= 1 && pagina <= totalPaginas;
  }
}
