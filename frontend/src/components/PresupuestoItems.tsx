import type { PresupuestoLinea } from "../types/presupuestoLinea";
import { formatMoneda } from "../utils/format";

type Props = {
  lineas: PresupuestoLinea[];
  onCantidad: (articuloId: number, cantidad: number) => void;
  onDescuento: (articuloId: number, descuentoPct: number) => void;
  onEliminar: (articuloId: number) => void;
};

export function PresupuestoItems({ lineas, onCantidad, onDescuento, onEliminar }: Props) {
  if (lineas.length === 0) {
    return <p className="status">Todavía no hay líneas. Buscá un artículo y agregalo.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="grid">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th className="num">Precio</th>
            <th className="num">IVA</th>
            <th className="num">Cantidad</th>
            <th className="num">Desc. %</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {lineas.map((linea) => (
            <tr key={linea.articuloId}>
              <td>{linea.codigo}</td>
              <td>{linea.descripcion}</td>
              <td className="num">{formatMoneda(linea.precioUnitario)}</td>
              <td className="num">{linea.alicuotaIva}%</td>
              <td className="num">
                <input
                  className="input-num"
                  type="number"
                  min={1}
                  step={1}
                  value={linea.cantidad}
                  onChange={(e) => onCantidad(linea.articuloId, Number(e.target.value))}
                />
              </td>
              <td className="num">
                <input
                  className="input-num"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={linea.descuentoPct}
                  onChange={(e) => onDescuento(linea.articuloId, Number(e.target.value))}
                />
              </td>
              <td>
                <button type="button" onClick={() => onEliminar(linea.articuloId)}>
                  Quitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
