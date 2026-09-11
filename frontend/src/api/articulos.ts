import { getJson } from "./http";
import type { Articulo } from "../types/articulo";

export function getArticulos(busqueda?: string): Promise<Articulo[]> {
  const texto = busqueda?.trim();
  const query = texto ? `?busqueda=${encodeURIComponent(texto)}` : "";
  return getJson<Articulo[]>(`/api/articulos${query}`);
}
