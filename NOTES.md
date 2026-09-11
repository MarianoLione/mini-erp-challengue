# NOTES

> Completá este archivo a medida que avanzás. Es parte de la entrega.

## Bugs encontrados (backend)

### 1. IVA por línea

`CalcularTotales` aplicaba 21% sobre el subtotal completo e ignoraba `AlicuotaIva`. Con alícuotas mixtas el IVA quedaba mal (el test esperaba 231 y obtenía 252).

El descuento por línea se dejó como estaba (antes del IVA). Ahora cada línea calcula su IVA con su alícuota, se redondea a 2 decimales con `MidpointRounding.AwayFromZero` y recién después se suman. El total es subtotal + IVA.

Verificado con el test de alícuotas mixtas y con el caso del README: una unidad de ART-001 (21%) y una de ART-004 (10,5%) → subtotal 39.500, IVA 7.822,50, total 47.322,50.

### 2. Stock insuficiente

`FacturarAsync` restaba stock línea a línea sin chequear disponibilidad. El stock podía quedar negativo. Además, dos líneas del mismo artículo podían pasar cada una y fallar en conjunto (por ejemplo stock 5 y cantidades 3 + 3).

Se agrupa por `ArticuloId`, se suma la cantidad pedida, se valida todo contra `StockActual` y recién después se descuenta. Si falta stock se lanza `InvalidOperationException` sin haber mutado entidades (importante: el test reusa el mismo `DbContext`).

Verificado con el test de stock insuficiente y en Swagger (ART-006 con cantidad mayor al stock → 400, stock sin cambio).

### 3. Doble facturación

Un presupuesto se podía facturar más de una vez: nueva factura y otro descuento de stock. El código marcaba `Estado = Facturado` pero nunca lo leía.

Después de cargar el presupuesto, si ya está `Facturado` se lanza `InvalidOperationException` antes de tocar stock o crear factura. No se agregaron índices únicos ni transacciones; alcanza para el challenge, no cubre dos requests concurrentes.

Verificado con el test de doble facturación y con una segunda llamada en Swagger → 400.

### 4. Presupuestos nuevos no aparecían en el listado

`CrearAsync` guarda en `Borrador` y `ListarAsync` excluía ese estado. El POST devolvía el DTO, pero `GET /api/presupuestos` no lo mostraba. No hay endpoint de aprobación.

Se quitó solo el filtro. El alta sigue en `Borrador`; no se inventó un flujo de estados.

Verificado: POST + GET lista, el recién creado aparece.

### 5. Numeración de presupuestos

`ProximoNumeroPresupuestoAsync` usaba `Count() + 1`. Al borrar filas podía reutilizar un número ya emitido. `Max(Numero) + 1` tampoco alcanza para el flujo del README: 1 → 2 → borrar 2 → el siguiente tiene que ser 3 (el 2 ya se emitió).

Hay un `Numerador` persistido (`Clave = "Presupuesto"`, `UltimoNumero`) independiente de las filas vivas. Si no existe, se inicializa con el máximo actual o 0. Cada alta incrementa el contador; se guarda junto con el presupuesto en el `SaveChanges` de `CrearAsync`. Las facturas siguen con `Max() + 1`.

Como el proyecto usa `EnsureCreated`, una SQLite ya creada no suma la tabla sola: hay que regenerar `backend/MiniErp.Api/minierp.db`.

Verificado a mano: 1 → 2 → borrar 2 → 3 → 4. Esto no resuelve dos POST simultáneos. También hay un test propio: crear 1 y 2, borrar el 2, el siguiente es 3.

### 6. Datos inválidos

`CrearAsync` aceptaba cantidad 0 o negativa y descuentos fuera de rango.

`Cantidad` tiene que ser > 0 y `DescuentoPct` entre 0 y 100 inclusive. Se lanza `InvalidOperationException` y el controller responde 400. Sin FluentValidation ni DataAnnotations.

Verificado en Swagger y con tests propios: cantidad 0 y -1 → excepción; descuento -1 y 101 → excepción; descuento 0 y 100 → válidos.

## Decisiones del cliente React

Vite + React + TypeScript. `fetch` nativo. Sin Redux, Axios, React Query ni UI kit. Navegación por estado local en `App` (`lista` | `nuevo`), sin router. Carpetas: `api`, `types`, `pages`, `components`, `utils`.

**Listado:** `GET /api/presupuestos`. Estados de carga, error y vacío. Fechas y montos en `es-AR`. Facturar desde la grilla.

**Alta:** clientes con `GET /api/clientes`. Artículos con `GET /api/articulos?busqueda=`, solo al pulsar Buscar o Enter (no por tecla). Un artículo no se duplica en las líneas. Cantidad y descuento editables; se puede quitar una línea.

**Totales en vivo:** descuento antes del IVA; IVA por línea con `AlicuotaIva`, redondeado a 2 decimales; subtotal, IVA y total se actualizan al cambiar líneas. El front es ayuda visual; el backend es la fuente de verdad.

**Creación:** `POST /api/presupuestos` con `clienteId`, `validezDias` e items (`articuloId`, `cantidad`, `descuentoPct`). No se envían precio, alícuota ni totales. Loading, sin doble submit, error visible. Si el POST sale bien, vuelve al listado y se vuelve a pedir la lista.

**Facturación:** `POST /api/facturas/facturar/{id}`. Loading por fila. El error de la API se muestra sin ocultar la grilla. Tras el éxito se refresca el listado. Si el estado es `Facturado`, no se puede facturar de nuevo desde la UI.

## Qué hice y qué dejé afuera

Must-have: los 6 bugs de backend; listado; alta; búsqueda y agregado de artículos; cantidad y descuento; totales en vivo; creación por API; facturación y errores.

Stretch: tests propios de backend. Se agregaron **8 tests nuevos** sin tocar los 6 entregados.

Cobertura extra: numeración 1 → 2 → borrar 2 → 3; cantidad 0 y negativa; descuentos fuera de rango; límites 0 y 100; stock acumulado si el mismo artículo está en varias líneas.

`dotnet test`: **14 passed / 0 failed**.

Dejé afuera duplicar presupuesto y reporte top N. Primero cerré y verifiqué el flujo obligatorio y sumé tests; la funcionalidad opcional puede esperar.

## Cómo usé IA

Usé Cursor como asistente: leer el README y el código, armar un plan, implementar un fix segun corresponda, correr tests, revisar el diff y recién después commitear.

No acepté las propuestas de entrada. El plan inicial sugería `Max(Numero) + 1` para numeración; al contrastarlo con 1 → 2 → borrar 2 → 3 se vio que reutilizaba el 2, y se cambió a un contador persistido. El análisis de stock se ajustó para sumar cantidades cuando el mismo `ArticuloId` aparece en más de una línea.

En el front, después de un POST 200 apareció `onCreado is not a function`. El presupuesto sí se había creado; fallaba el callback de React. `App` no pasaba `onCreado` (solo `onVolver`). Se cableó el callback, se volvió a probar el alta y el listado se refrescó.

Cada cambio se revisó y verificó antes de commitearlo.

## Qué haría con más tiempo / qué falta para producción

Backend:

- lock o actualización condicional del contador ante altas concurrentes;
- índice único en `Presupuesto.Numero` (y en números de factura);
- unique en `Factura.PresupuestoId`;
- transacción / update condicional de stock si dos facturaciones corren a la vez;
- migraciones EF en lugar de `EnsureCreated`.

Parte de numeración, validación de alta y stock multi-línea ya tiene tests propios. Seguiría cubriendo listado, validez al facturar y concurrencia.

Frontend:

- tests unitarios de `calcularTotales`;
- tests de formulario y grilla;
- E2E de alta y facturación;
- feedback visual más claro;
- router si la app crece.

Funcionalidad futura del challenge: duplicar presupuesto y reporte top N.

## Verificación general

`dotnet test` en `backend`: 14 passed / 0 failed. Los 6 tests del challenge no se modificaron. Front: `npm run lint` y `npm run build` OK. Flujos de UI se probaron a mano contra la API en `localhost:5080`.
