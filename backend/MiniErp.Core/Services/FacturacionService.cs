using Microsoft.EntityFrameworkCore;
using MiniErp.Core.Data;
using MiniErp.Core.Models;

namespace MiniErp.Core.Services;

public class FacturacionService
{
    private readonly AppDbContext _db;
    private readonly PresupuestoService _presupuestos;
    private readonly NumeracionService _numeracion;

    public FacturacionService(AppDbContext db, PresupuestoService presupuestos, NumeracionService numeracion)
    {
        _db = db;
        _presupuestos = presupuestos;
        _numeracion = numeracion;
    }

    public async Task<Factura> FacturarAsync(int presupuestoId)
    {
        var presupuesto = await _db.Presupuestos
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == presupuestoId)
            ?? throw new InvalidOperationException("El presupuesto no existe.");

        var vencimiento = presupuesto.Fecha.AddDays(presupuesto.ValidezDias);
        if (DateTime.UtcNow > vencimiento)
            throw new InvalidOperationException("El presupuesto esta vencido y no se puede facturar.");

        var requeridoPorArticulo = presupuesto.Items
            .GroupBy(i => i.ArticuloId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Cantidad));

        var articulos = await _db.Articulos
            .Where(a => requeridoPorArticulo.Keys.Contains(a.Id))
            .ToDictionaryAsync(a => a.Id);

        foreach (var (articuloId, cantidadRequerida) in requeridoPorArticulo)
        {
            if (!articulos.TryGetValue(articuloId, out var articulo) || articulo.StockActual < cantidadRequerida)
                throw new InvalidOperationException("No hay stock suficiente para facturar el presupuesto.");
        }

        foreach (var (articuloId, cantidadRequerida) in requeridoPorArticulo)
            articulos[articuloId].StockActual -= cantidadRequerida;

        var totales = _presupuestos.CalcularTotales(presupuesto);

        var factura = new Factura
        {
            Numero = await _numeracion.ProximoNumeroFacturaAsync(),
            Fecha = DateTime.UtcNow,
            PresupuestoId = presupuesto.Id,
            Subtotal = totales.Subtotal,
            Iva = totales.Iva,
            Total = totales.Total
        };

        presupuesto.Estado = EstadoPresupuesto.Facturado;
        _db.Facturas.Add(factura);
        await _db.SaveChangesAsync();
        return factura;
    }
}
