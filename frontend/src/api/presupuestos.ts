import { getJson } from "./http";
import type { Presupuesto } from "../types/presupuesto";

export function getPresupuestos(): Promise<Presupuesto[]> {
  return getJson<Presupuesto[]>("/api/presupuestos");
}
