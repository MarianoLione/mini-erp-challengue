import { useEffect, useState } from "react";
import { getPresupuestos } from "../api/presupuestos";
import type { Presupuesto } from "../types/presupuesto";
import { formatFecha, formatMoneda } from "../utils/format";

export function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    getPresupuestos()
      .then((data) => {
        if (!cancelado) setPresupuestos(data);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar los presupuestos.");
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (error) {
    return <p className="status status-error">{error}</p>;
  }

  if (presupuestos === null) {
    return <p className="status">Cargando presupuestos…</p>;
  }

  if (presupuestos.length === 0) {
    return <p className="status">No hay presupuestos.</p>;
  }

  return (
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
          </tr>
        </thead>
        <tbody>
          {presupuestos.map((p) => (
            <tr key={p.id}>
              <td>{p.numero}</td>
              <td>{formatFecha(p.fecha)}</td>
              <td>{p.clienteRazonSocial}</td>
              <td>{p.estado}</td>
              <td className="num">{formatMoneda(p.subtotal)}</td>
              <td className="num">{formatMoneda(p.iva)}</td>
              <td className="num">{formatMoneda(p.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
