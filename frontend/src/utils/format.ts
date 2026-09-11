const monedaAr = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const fechaAr = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatMoneda(valor: number): string {
  return monedaAr.format(valor);
}

export function formatFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fechaAr.format(fecha);
}
