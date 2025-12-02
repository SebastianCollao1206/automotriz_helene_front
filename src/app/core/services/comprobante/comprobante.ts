import { Injectable } from '@angular/core';
// import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
// import { VentaResponse, TipoComprobante } from '../../../models/venta';
// import { construirNombreProducto } from '../../../shared/utils/producto-nombre';

//(pdfMake as any).vfs = pdfFonts.vfs;

@Injectable({
  providedIn: 'root'
})
export class Comprobante {

  // generarComprobante(venta: VentaResponse): void {
  //   const documentDefinition = this.crearDocumento(venta);
  //   pdfMake.createPdf(documentDefinition).download(
  //     `${venta.tipoComprobante}-${venta.numeroComprobante}.pdf`
  //   );
  // }

  // private crearDocumento(venta: VentaResponse): TDocumentDefinitions {
  //   const esFactura = venta.tipoComprobante === TipoComprobante.FACTURA;

  //   // Construir el contenido como array tipado
  //   const content: Content[] = [
  //     // Encabezado
  //     {
  //       columns: [
  //         {
  //           width: '*',
  //           stack: [
  //             { text: 'TU EMPRESA S.A.C.', style: 'empresa', bold: true },
  //             { text: 'RUC: 20XXXXXXXXX', style: 'rucEmpresa' },
  //             { text: 'Av. Principal 123, Lima - Perú', style: 'textoNormal' },
  //             { text: 'Teléfono: (01) 123-4567', style: 'textoNormal' },
  //             { text: 'Email: ventas@tuempresa.com', style: 'textoNormal' }
  //           ]
  //         },
  //         {
  //           width: 200,
  //           stack: [
  //             {
  //               canvas: [
  //                 {
  //                   type: 'rect',
  //                   x: 0,
  //                   y: 0,
  //                   w: 180,
  //                   h: 80,
  //                   r: 5,
  //                   lineColor: '#1e40af',
  //                   lineWidth: 2
  //                 }
  //               ]
  //             },
  //             {
  //               text: 'RUC: 20XXXXXXXXX',
  //               style: 'rucComprobante',
  //               margin: [0, -75, 0, 0],
  //               alignment: 'center'
  //             },
  //             {
  //               text: venta.tipoComprobante,
  //               style: 'tipoComprobante',
  //               margin: [0, 5, 0, 0],
  //               alignment: 'center'
  //             },
  //             {
  //               text: venta.numeroComprobante,
  //               style: 'numeroComprobante',
  //               margin: [0, 5, 0, 0],
  //               alignment: 'center'
  //             }
  //           ]
  //         }
  //       ],
  //       margin: [0, 0, 0, 20]
  //     },

  //     // Línea separadora
  //     {
  //       canvas: [
  //         {
  //           type: 'line',
  //           x1: 0,
  //           y1: 0,
  //           x2: 515,
  //           y2: 0,
  //           lineWidth: 1,
  //           lineColor: '#e4e4e7'
  //         }
  //       ],
  //       margin: [0, 0, 0, 15]
  //     },

  //     // Datos del cliente
  //     {
  //       text: 'DATOS DEL CLIENTE',
  //       style: 'seccionTitulo',
  //       margin: [0, 0, 0, 10]
  //     },
  //     {
  //       columns: [
  //         {
  //           width: '50%',
  //           stack: [
  //             {
  //               text: [
  //                 { text: `${esFactura ? 'Razón Social: ' : 'Nombre: '}`, bold: true },
  //                 { text: venta.cliente.nombre }
  //               ],
  //               style: 'textoNormal'
  //             },
  //             {
  //               text: [
  //                 { text: `${esFactura ? 'RUC: ' : 'DNI: '}`, bold: true },
  //                 { text: esFactura ? venta.cliente.ruc : venta.cliente.dni }
  //               ],
  //               style: 'textoNormal',
  //               margin: [0, 3, 0, 0]
  //             }
  //           ]
  //         },
  //         {
  //           width: '50%',
  //           stack: [
  //             {
  //               text: [
  //                 { text: 'Fecha de Emisión: ', bold: true },
  //                 { text: this.formatearFecha(venta.fecha) }
  //               ],
  //               style: 'textoNormal'
  //             },
  //             {
  //               text: [
  //                 { text: 'Método de Pago: ', bold: true },
  //                 { text: venta.metodoPago }
  //               ],
  //               style: 'textoNormal',
  //               margin: [0, 3, 0, 0]
  //             }
  //           ]
  //         }
  //       ],
  //       margin: [0, 0, 0, 5]
  //     }
  //   ];

  //   // Agregar dirección fiscal si existe
  //   if (venta.cliente.direccionFiscal) {
  //     content.push({
  //       text: [
  //         { text: 'Dirección: ', bold: true },
  //         { text: venta.cliente.direccionFiscal }
  //       ],
  //       style: 'textoNormal',
  //       margin: [0, 3, 0, 0]
  //     });
  //   }

  //   // Continuar con el resto del contenido
  //   content.push(
  //     // Línea separadora
  //     {
  //       canvas: [
  //         {
  //           type: 'line',
  //           x1: 0,
  //           y1: 0,
  //           x2: 515,
  //           y2: 0,
  //           lineWidth: 1,
  //           lineColor: '#e4e4e7'
  //         }
  //       ],
  //       margin: [0, 15, 0, 15]
  //     },

  //     // Detalle de productos
  //     {
  //       text: 'DETALLE DE PRODUCTOS',
  //       style: 'seccionTitulo',
  //       margin: [0, 0, 0, 10]
  //     },
  //     {
  //       table: {
  //         headerRows: 1,
  //         widths: ['auto', '*', 'auto', 'auto', 'auto'],
  //         body: [
  //           [
  //             { text: 'CANT.', style: 'tablaHeader' },
  //             { text: 'DESCRIPCIÓN', style: 'tablaHeader' },
  //             { text: 'P. UNIT.', style: 'tablaHeader' },
  //             { text: 'SUBTOTAL', style: 'tablaHeader' },
  //             { text: 'TOTAL', style: 'tablaHeader' }
  //           ],
  //           ...venta.detalles.map(detalle => [
  //             { text: detalle.cantidad.toString(), style: 'tablaCelda', alignment: 'center' as const },
  //             { text: detalle.producto, style: 'tablaCelda' },
  //             { text: `S/ ${detalle.precioUnitario.toFixed(2)}`, style: 'tablaCelda', alignment: 'right' as const },
  //             { text: `S/ ${detalle.subtotal.toFixed(2)}`, style: 'tablaCelda', alignment: 'right' as const },
  //             { text: `S/ ${detalle.subtotal.toFixed(2)}`, style: 'tablaCelda', alignment: 'right' as const }
  //           ])
  //         ]
  //       },
  //       layout: {
  //         fillColor: (rowIndex: number) => {
  //           return rowIndex === 0 ? '#f4f4f5' : (null as any);
  //         },
  //         hLineWidth: () => 0.5,
  //         vLineWidth: () => 0.5,
  //         hLineColor: () => '#e4e4e7',
  //         vLineColor: () => '#e4e4e7'
  //       }
  //     } as any,

  //     // Totales
  //     {
  //       columns: [
  //         { width: '*', text: '' },
  //         {
  //           width: 250,
  //           stack: [
  //             {
  //               canvas: [
  //                 {
  //                   type: 'line',
  //                   x1: 0,
  //                   y1: 0,
  //                   x2: 250,
  //                   y2: 0,
  //                   lineWidth: 1,
  //                   lineColor: '#e4e4e7'
  //                 }
  //               ],
  //               margin: [0, 10, 0, 10]
  //             },
  //             {
  //               columns: [
  //                 { text: 'SUB TOTAL:', style: 'totalesLabel', width: '*' },
  //                 { text: `S/ ${this.calcularSubtotal(venta).toFixed(2)}`, style: 'totalesValor', width: 'auto' }
  //               ]
  //             },
  //             {
  //               columns: [
  //                 { text: 'IGV (18%):', style: 'totalesLabel', width: '*' },
  //                 { text: `S/ ${this.calcularIGV(venta).toFixed(2)}`, style: 'totalesValor', width: 'auto' }
  //               ],
  //               margin: [0, 5, 0, 0]
  //             },
  //             {
  //               canvas: [
  //                 {
  //                   type: 'line',
  //                   x1: 0,
  //                   y1: 0,
  //                   x2: 250,
  //                   y2: 0,
  //                   lineWidth: 1,
  //                   lineColor: '#e4e4e7'
  //                 }
  //               ],
  //               margin: [0, 8, 0, 8]
  //             },
  //             {
  //               columns: [
  //                 { text: 'TOTAL:', style: 'totalLabel', width: '*' },
  //                 { text: `S/ ${venta.total.toFixed(2)}`, style: 'totalValor', width: 'auto' }
  //               ]
  //             }
  //           ]
  //         }
  //       ],
  //       margin: [0, 15, 0, 0]
  //     },

  //     // Monto en letras
  //     {
  //       text: `SON: ${this.numeroALetras(venta.total)} SOLES`,
  //       style: 'montoLetras',
  //       margin: [0, 20, 0, 0]
  //     },

  //     // Observaciones
  //     {
  //       canvas: [
  //         {
  //           type: 'line',
  //           x1: 0,
  //           y1: 0,
  //           x2: 515,
  //           y2: 0,
  //           lineWidth: 1,
  //           lineColor: '#e4e4e7'
  //         }
  //       ],
  //       margin: [0, 20, 0, 15]
  //     },
  //     {
  //       text: 'OBSERVACIONES',
  //       style: 'seccionTitulo',
  //       margin: [0, 0, 0, 8]
  //     },
  //     {
  //       text: '• Gracias por su compra.\n• Los productos tienen garantía según lo establecido por ley.\n• Conserve este comprobante para cualquier reclamo.',
  //       style: 'observaciones'
  //     },

  //     // Pie de página
  //     {
  //       canvas: [
  //         {
  //           type: 'line',
  //           x1: 0,
  //           y1: 0,
  //           x2: 515,
  //           y2: 0,
  //           lineWidth: 1,
  //           lineColor: '#e4e4e7'
  //         }
  //       ],
  //       margin: [0, 20, 0, 10]
  //     },
  //     {
  //       text: 'Representación impresa del comprobante electrónico',
  //       style: 'pieTexto',
  //       alignment: 'center'
  //     },
  //     {
  //       text: `Usuario: ${venta.usuario}`,
  //       style: 'pieTexto',
  //       alignment: 'center',
  //       margin: [0, 3, 0, 0]
  //     }
  //   );

  //   return {
  //     pageSize: 'A4',
  //     pageMargins: [40, 60, 40, 60],
  //     content: content,
  //     styles: {
  //       empresa: {
  //         fontSize: 14,
  //         color: '#18181b'
  //       },
  //       rucEmpresa: {
  //         fontSize: 10,
  //         color: '#52525b',
  //         margin: [0, 3, 0, 0]
  //       },
  //       textoNormal: {
  //         fontSize: 9,
  //         color: '#3f3f46',
  //         margin: [0, 1, 0, 0]
  //       },
  //       rucComprobante: {
  //         fontSize: 11,
  //         bold: true,
  //         color: '#1e40af'
  //       },
  //       tipoComprobante: {
  //         fontSize: 16,
  //         bold: true,
  //         color: '#1e40af'
  //       },
  //       numeroComprobante: {
  //         fontSize: 13,
  //         bold: true,
  //         color: '#18181b'
  //       },
  //       seccionTitulo: {
  //         fontSize: 11,
  //         bold: true,
  //         color: '#18181b'
  //       },
  //       tablaHeader: {
  //         fontSize: 9,
  //         bold: true,
  //         color: '#18181b',
  //         fillColor: '#f4f4f5'
  //       },
  //       tablaCelda: {
  //         fontSize: 9,
  //         color: '#3f3f46'
  //       },
  //       totalesLabel: {
  //         fontSize: 10,
  //         color: '#52525b'
  //       },
  //       totalesValor: {
  //         fontSize: 10,
  //         color: '#18181b'
  //       },
  //       totalLabel: {
  //         fontSize: 12,
  //         bold: true,
  //         color: '#18181b'
  //       },
  //       totalValor: {
  //         fontSize: 12,
  //         bold: true,
  //         color: '#16a34a'
  //       },
  //       montoLetras: {
  //         fontSize: 9,
  //         bold: true,
  //         color: '#52525b',
  //         italics: true
  //       },
  //       observaciones: {
  //         fontSize: 8,
  //         color: '#71717a'
  //       },
  //       pieTexto: {
  //         fontSize: 8,
  //         color: '#a1a1aa'
  //       }
  //     },
  //     defaultStyle: {
  //       font: 'Roboto'
  //     }
  //   };
  // }

  // private formatearFecha(fecha: string): string {
  //   const date = new Date(fecha);
  //   const dia = date.getDate().toString().padStart(2, '0');
  //   const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const anio = date.getFullYear();
  //   const hora = date.getHours().toString().padStart(2, '0');
  //   const minutos = date.getMinutes().toString().padStart(2, '0');
  //   return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
  // }

  // private calcularSubtotal(venta: VentaResponse): number {
  //   const total = venta.total;
  //   return total / 1.18;
  // }

  // private calcularIGV(venta: VentaResponse): number {
  //   const subtotal = this.calcularSubtotal(venta);
  //   return subtotal * 0.18;
  // }

  // private numeroALetras(numero: number): string {
  //   const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  //   const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  //   const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  //   const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  //   const parteEntera = Math.floor(numero);
  //   const parteDecimal = Math.round((numero - parteEntera) * 100);

  //   if (parteEntera === 0) return `CERO Y ${parteDecimal.toString().padStart(2, '0')}/100`;

  //   let resultado = '';

  //   // Miles
  //   const miles = Math.floor(parteEntera / 1000);
  //   if (miles > 0) {
  //     if (miles === 1) {
  //       resultado += 'MIL ';
  //     } else {
  //       resultado += this.convertirCentenas(miles) + ' MIL ';
  //     }
  //   }

  //   // Centenas, decenas y unidades
  //   const resto = parteEntera % 1000;
  //   resultado += this.convertirCentenas(resto);

  //   return `${resultado.trim()} Y ${parteDecimal.toString().padStart(2, '0')}/100`;
  // }

  // private convertirCentenas(numero: number): string {
  //   const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  //   const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  //   const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  //   const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  //   let resultado = '';

  //   const cen = Math.floor(numero / 100);
  //   const dec = Math.floor((numero % 100) / 10);
  //   const uni = numero % 10;

  //   // Centenas
  //   if (cen > 0) {
  //     if (numero === 100) {
  //       resultado += 'CIEN';
  //     } else {
  //       resultado += centenas[cen] + ' ';
  //     }
  //   }

  //   // Decenas y unidades
  //   if (dec === 1) {
  //     resultado += especiales[uni];
  //   } else {
  //     if (dec > 0) {
  //       resultado += decenas[dec];
  //       if (uni > 0) {
  //         resultado += ' Y ';
  //       }
  //     }
  //     if (uni > 0 && dec !== 1) {
  //       resultado += unidades[uni];
  //     }
  //   }

  //   return resultado.trim();
  // }

}
