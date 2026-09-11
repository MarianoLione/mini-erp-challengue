import { useEffect, useMemo, useState } from "react";
import { ArticuloSearch } from "../components/ArticuloSearch";
import { PresupuestoItems } from "../components/PresupuestoItems";
import { getClientes } from "../api/clientes";
import { crearPresupuesto } from "../api/presupuestos";
import type { Articulo } from "../types/articulo";
import type { Cliente } from "../types/cliente";
import type { PresupuestoLinea } from "../types/presupuestoLinea";
import { formatMoneda } from "../utils/format";
import { calcularTotales } from "../utils/totales";

type Props = {
  onVolver: () => void;
  onCreado: () => void;
};

export function NuevoPresupuestoPage({ onVolver, onCreado }: Props) {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState<number | "">("");
  const [validezDias, setValidezDias] = useState(15);
  const [lineas, setLineas] = useState<PresupuestoLinea[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    getClientes()
      .then((data) => {
        if (!cancelado) setClientes(data);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErrorClientes(err instanceof Error ? err.message : "No se pudieron cargar los clientes.");
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const idsAgregados = useMemo(
    () => new Set(lineas.map((l) => l.articuloId)),
    [lineas],
  );

  const totales = useMemo(() => calcularTotales(lineas), [lineas]);

  function agregarArticulo(articulo: Articulo) {
    setLineas((prev) => {
      if (prev.some((l) => l.articuloId === articulo.id)) return prev;
      return [
        ...prev,
        {
          articuloId: articulo.id,
          codigo: articulo.codigo,
          descripcion: articulo.descripcion,
          precioUnitario: articulo.precioUnitario,
          alicuotaIva: articulo.alicuotaIva,
          cantidad: 1,
          descuentoPct: 0,
        },
      ];
    });
  }

  function cambiarCantidad(articuloId: number, cantidad: number) {
    if (!Number.isFinite(cantidad)) return;
    const valor = Math.max(1, Math.floor(cantidad));
    setLineas((prev) =>
      prev.map((l) => (l.articuloId === articuloId ? { ...l, cantidad: valor } : l)),
    );
  }

  function cambiarDescuento(articuloId: number, descuentoPct: number) {
    if (!Number.isFinite(descuentoPct)) return;
    const valor = Math.min(100, Math.max(0, descuentoPct));
    setLineas((prev) =>
      prev.map((l) => (l.articuloId === articuloId ? { ...l, descuentoPct: valor } : l)),
    );
  }

  function eliminarLinea(articuloId: number) {
    setLineas((prev) => prev.filter((l) => l.articuloId !== articuloId));
  }

  function mensajeValidacion(): string | null {
    if (clienteId === "") return "Seleccioná un cliente.";
    if (validezDias <= 0) return "La validez debe ser mayor que 0.";
    if (lineas.length === 0) return "Agregá al menos un artículo.";
    if (lineas.some((l) => l.cantidad <= 0)) return "La cantidad debe ser mayor que 0.";
    if (lineas.some((l) => l.descuentoPct < 0 || l.descuentoPct > 100)) {
      return "El descuento debe estar entre 0 y 100.";
    }
    return null;
  }

  const invalido = mensajeValidacion() !== null;

  async function guardar() {
    const validacion = mensajeValidacion();
    if (validacion || guardando) {
      setErrorGuardar(validacion);
      return;
    }

    if (clienteId === "") return;

    setGuardando(true);
    setErrorGuardar(null);

    try {
      await crearPresupuesto({
        clienteId,
        validezDias,
        items: lineas.map((l) => ({
          articuloId: l.articuloId,
          cantidad: l.cantidad,
          descuentoPct: l.descuentoPct,
        })),
      });
      onCreado();
    } catch (err: unknown) {
      setErrorGuardar(err instanceof Error ? err.message : "No se pudo crear el presupuesto.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section>
      <div className="toolbar">
        <h2>Nuevo presupuesto</h2>
        <button type="button" onClick={onVolver}>
          Volver al listado
        </button>
      </div>

      <div className="form-grid">
        <label>
          Cliente
          {errorClientes && <span className="status status-error"> {errorClientes}</span>}
          {clientes === null && !errorClientes && <span className="status"> Cargando…</span>}
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={clientes === null || Boolean(errorClientes)}
          >
            <option value="">Seleccionar cliente</option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razonSocial}
              </option>
            ))}
          </select>
        </label>

        <label>
          Validez (días)
          <input
            type="number"
            min={1}
            step={1}
            value={validezDias}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              setValidezDias(Math.max(1, Math.floor(n)));
            }}
          />
        </label>
      </div>

      <ArticuloSearch idsAgregados={idsAgregados} onAgregar={agregarArticulo} />

      <section className="panel">
        <h3>Líneas</h3>
        <PresupuestoItems
          lineas={lineas}
          onCantidad={cambiarCantidad}
          onDescuento={cambiarDescuento}
          onEliminar={eliminarLinea}
        />

        <dl className="totales">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoneda(totales.subtotal)}</dd>
          </div>
          <div>
            <dt>IVA</dt>
            <dd>{formatMoneda(totales.iva)}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatMoneda(totales.total)}</dd>
          </div>
        </dl>

        <div className="acciones">
          <button type="button" onClick={() => void guardar()} disabled={guardando || invalido}>
            {guardando ? "Guardando…" : "Crear presupuesto"}
          </button>
          {guardando && <span className="status">Guardando presupuesto…</span>}
          {errorGuardar && <p className="status status-error">{errorGuardar}</p>}
        </div>
      </section>
    </section>
  );
}
