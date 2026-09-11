export type Totales = {
  subtotal: number;
  iva: number;
  total: number;
};

export type LineaParaTotales = {
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
  alicuotaIva: number;
};

/**
 * Redondeo a 2 decimales para importes positivos.
 * Math.round sobre centavos aleja el .5 de cero (hacia +∞),
 * equivalente a MidpointRounding.AwayFromZero en .NET para valores > 0.
 * Number.EPSILON corrige errores típicos al escalar IEEE-754 (p. ej. 1.005).
 */
export function redondear2AwayFromZero(valor: number): number {
  return Math.round(valor * 100 + Number.EPSILON) / 100;
}

export function calcularTotales(lineas: LineaParaTotales[]): Totales {
  let subtotal = 0;
  let iva = 0;

  for (const linea of lineas) {
    const subtotalLinea =
      linea.cantidad * linea.precioUnitario * (1 - linea.descuentoPct / 100);
    const ivaLinea = redondear2AwayFromZero((subtotalLinea * linea.alicuotaIva) / 100);
    subtotal += subtotalLinea;
    iva += ivaLinea;
  }

  return { subtotal, iva, total: subtotal + iva };
}
