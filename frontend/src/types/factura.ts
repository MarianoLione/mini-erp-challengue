export type Factura = {
  id: number;
  numero: number;
  fecha: string;
  presupuestoId: number;
  subtotal: number;
  iva: number;
  total: number;
};
