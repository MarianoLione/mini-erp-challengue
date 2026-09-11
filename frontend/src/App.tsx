import { useState } from "react";
import { NuevoPresupuestoPage } from "./pages/NuevoPresupuestoPage";
import { PresupuestosPage } from "./pages/PresupuestosPage";
import "./App.css";

type Vista = "lista" | "nuevo";

function App() {
  const [vista, setVista] = useState<Vista>("lista");

  return (
    <main className="app">
      <h1>Mini ERP</h1>
      {vista === "lista" ? (
        <>
          <div className="toolbar">
            <h2>Presupuestos</h2>
            <button type="button" onClick={() => setVista("nuevo")}>
              Nuevo presupuesto
            </button>
          </div>
          <PresupuestosPage />
        </>
      ) : (
        <NuevoPresupuestoPage onVolver={() => setVista("lista")} />
      )}
    </main>
  );
}

export default App;
