import { getJson, postJson } from "./http";
import type { CrearPresupuestoRequest, Presupuesto } from "../types/presupuesto";

export function getPresupuestos(): Promise<Presupuesto[]> {
  return getJson<Presupuesto[]>("/api/presupuestos");
}

export function crearPresupuesto(input: CrearPresupuestoRequest): Promise<Presupuesto> {
  return postJson<Presupuesto>("/api/presupuestos", input);
}
