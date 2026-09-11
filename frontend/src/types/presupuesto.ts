export type PresupuestoItem = {
  articuloId: number;
  articuloCodigo: string;
  articuloDescripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
  alicuotaIva: number;
  subtotalLinea: number;
};

export type Presupuesto = {
  id: number;
  numero: number;
  fecha: string;
  clienteId: number;
  clienteRazonSocial: string;
  estado: string;
  validezDias: number;
  items: PresupuestoItem[];
  subtotal: number;
  iva: number;
  total: number;
};
