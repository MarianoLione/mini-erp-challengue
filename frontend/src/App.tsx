import { useState } from "react";
import { NuevoPresupuestoPage } from "./pages/NuevoPresupuestoPage";
import { PresupuestosPage } from "./pages/PresupuestosPage";
import "./App.css";

type Vista = "lista" | "nuevo";

function App() {
  const [vista, setVista] = useState<Vista>("lista");
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <main className="app">
      <h1>Mini ERP</h1>
      {vista === "lista" ? (
        <>
          <div className="toolbar">
            <h2>Presupuestos</h2>
            <button
              type="button"
              onClick={() => {
                setMensaje(null);
                setVista("nuevo");
              }}
            >
              Nuevo presupuesto
            </button>
          </div>
          {mensaje && <p className="status status-ok">{mensaje}</p>}
          <PresupuestosPage />
        </>
      ) : (
        <NuevoPresupuestoPage
          onVolver={() => setVista("lista")}
          onCreado={() => {
            setMensaje("Presupuesto creado.");
            setVista("lista");
          }}
        />
      )}
    </main>
  );
}

export default App;
