import { postJson } from "./http";
import type { Factura } from "../types/factura";

export function facturarPresupuesto(presupuestoId: number): Promise<Factura> {
  return postJson<Factura>(`/api/facturas/facturar/${presupuestoId}`);
}
