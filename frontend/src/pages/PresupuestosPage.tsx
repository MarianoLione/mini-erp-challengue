import { useEffect, useState } from "react";
import { facturarPresupuesto } from "../api/facturas";
import { getPresupuestos } from "../api/presupuestos";
import type { Presupuesto } from "../types/presupuesto";
import { formatFecha, formatMoneda } from "../utils/format";

export function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[] | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorFacturar, setErrorFacturar] = useState<string | null>(null);
  const [facturandoIds, setFacturandoIds] = useState<number[]>([]);

  useEffect(() => {
    let cancelado = false;

    getPresupuestos()
      .then((data) => {
        if (!cancelado) setPresupuestos(data);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErrorCarga(err instanceof Error ? err.message : "No se pudieron cargar los presupuestos.");
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  async function facturar(id: number) {
    if (facturandoIds.includes(id)) return;

    setFacturandoIds((prev) => [...prev, id]);
    setErrorFacturar(null);

    try {
      await facturarPresupuesto(id);
      setPresupuestos(await getPresupuestos());
    } catch (err: unknown) {
      setErrorFacturar(err instanceof Error ? err.message : "No se pudo facturar el presupuesto.");
    } finally {
      setFacturandoIds((prev) => prev.filter((item) => item !== id));
    }
  }

  if (errorCarga && presupuestos === null) {
    return <p className="status status-error">{errorCarga}</p>;
  }

  if (presupuestos === null) {
    return <p className="status">Cargando presupuestos…</p>;
  }

  if (presupuestos.length === 0) {
    return <p className="status">No hay presupuestos.</p>;
  }

  return (
    <>
      {errorFacturar && <p className="status status-error">{errorFacturar}</p>}
      <div className="table-wrap">
        <table className="grid">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th className="num">Subtotal</th>
              <th className="num">IVA</th>
              <th className="num">Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {presupuestos.map((p) => {
              const facturado = p.estado === "Facturado";
              const facturando = facturandoIds.includes(p.id);

              return (
                <tr key={p.id}>
                  <td>{p.numero}</td>
                  <td>{formatFecha(p.fecha)}</td>
                  <td>{p.clienteRazonSocial}</td>
                  <td>{p.estado}</td>
                  <td className="num">{formatMoneda(p.subtotal)}</td>
                  <td className="num">{formatMoneda(p.iva)}</td>
                  <td className="num">{formatMoneda(p.total)}</td>
                  <td>
                    {facturado ? (
                      <button type="button" disabled>
                        Facturado
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={facturando}
                        onClick={() => void facturar(p.id)}
                      >
                        {facturando ? "Facturando..." : "Facturar"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
