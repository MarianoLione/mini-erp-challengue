using Microsoft.EntityFrameworkCore;
using MiniErp.Core.Data;
using MiniErp.Core.Models;
using MiniErp.Core.Services;
using Xunit;

namespace MiniErp.Tests;

public class StockAcumuladoTests
{
    private static (FacturacionService fact, AppDbContext db) Armar()
    {
        var db = TestDbFactory.Create();
        var numeracion = new NumeracionService(db);
        var presupuestos = new PresupuestoService(db, numeracion);
        var fact = new FacturacionService(db, presupuestos, numeracion);
        return (fact, db);
    }

    [Fact]
    public async Task Facturar_MismoArticuloEnDosLineasSinStockAcumulado_LanzaYNoDescuenta()
    {
        var (fact, db) = Armar();

        var articulo = new Articulo
        {
            Codigo = "A1",
            Descripcion = "Articulo",
            PrecioUnitario = 100m,
            StockActual = 5,
            AlicuotaIva = 21m
        };
        var cliente = new Cliente
        {
            RazonSocial = "Cliente Test",
            Cuit = "20-00000000-0",
            CondicionIva = CondicionIva.ResponsableInscripto
        };
        db.Articulos.Add(articulo);
        db.Clientes.Add(cliente);
        await db.SaveChangesAsync();

        var presupuesto = new Presupuesto
        {
            Numero = 1,
            Fecha = DateTime.UtcNow,
            ClienteId = cliente.Id,
            ValidezDias = 30,
            Estado = EstadoPresupuesto.Aprobado,
            Items =
            [
                new PresupuestoItem { ArticuloId = articulo.Id, Cantidad = 3, PrecioUnitario = 100m, AlicuotaIva = 21m },
                new PresupuestoItem { ArticuloId = articulo.Id, Cantidad = 3, PrecioUnitario = 100m, AlicuotaIva = 21m }
            ]
        };
        db.Presupuestos.Add(presupuesto);
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() => fact.FacturarAsync(presupuesto.Id));

        var articuloActualizado = await db.Articulos.FirstAsync(a => a.Id == articulo.Id);
        Assert.Equal(5, articuloActualizado.StockActual);
        Assert.False(await db.Facturas.AnyAsync());
    }
}
