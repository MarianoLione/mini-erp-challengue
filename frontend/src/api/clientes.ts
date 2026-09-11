import { getJson } from "./http";
import type { Cliente } from "../types/cliente";

export function getClientes(): Promise<Cliente[]> {
  return getJson<Cliente[]>("/api/clientes");
}
