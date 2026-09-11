import { useState } from "react";
import { getArticulos } from "../api/articulos";
import type { Articulo } from "../types/articulo";
import { formatMoneda } from "../utils/format";

type Props = {
  idsAgregados: Set<number>;
  onAgregar: (articulo: Articulo) => void;
};

export function ArticuloSearch({ idsAgregados, onAgregar }: Props) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Articulo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function buscar() {
    setBuscando(true);
    setError(null);
    try {
      setResultados(await getArticulos(texto));
    } catch (err: unknown) {
      setResultados(null);
      setError(err instanceof Error ? err.message : "No se pudieron buscar artículos.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <section className="panel">
      <h3>Artículos</h3>
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault();
          void buscar();
        }}
      >
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Código o descripción"
          aria-label="Buscar artículos"
        />
        <button type="submit" disabled={buscando}>
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {error && <p className="status status-error">{error}</p>}

      {resultados && resultados.length === 0 && (
        <p className="status">No se encontraron artículos.</p>
      )}

      {resultados && resultados.length > 0 && (
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th className="num">Precio</th>
                <th className="num">IVA</th>
                <th className="num">Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {resultados.map((a) => {
                const yaAgregado = idsAgregados.has(a.id);
                return (
                  <tr key={a.id}>
                    <td>{a.codigo}</td>
                    <td>{a.descripcion}</td>
                    <td className="num">{formatMoneda(a.precioUnitario)}</td>
                    <td className="num">{a.alicuotaIva}%</td>
                    <td className="num">{a.stockActual}</td>
                    <td>
                      <button type="button" disabled={yaAgregado} onClick={() => onAgregar(a)}>
                        {yaAgregado ? "Agregado" : "Agregar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
