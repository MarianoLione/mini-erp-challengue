# Mini ERP — cliente

React + TypeScript + Vite. Consume la API en `http://localhost:5080`.

## Requisitos

- Node.js 18+
- Backend levantado (`cd backend/MiniErp.Api` && `dotnet run`)

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

URL de la API: por defecto `http://localhost:5080`. Override opcional:

```
VITE_API_URL=http://localhost:5080
```
