import { API_BASE_URL } from "./api/config";
import "./App.css";

function App() {
  return (
    <main className="app">
      <h1>Mini ERP</h1>
      <p>Cliente React listo. El listado y el alta de presupuestos vienen en el próximo paso.</p>
      <p className="api">
        API: <code>{API_BASE_URL}</code>
      </p>
    </main>
  );
}

export default App;
