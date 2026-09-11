using MiniErp.Core.Data;
using MiniErp.Core.Models;
using MiniErp.Core.Services;
using Xunit;

namespace MiniErp.Tests;

public class ValidacionPresupuestoTests
{
    private static (PresupuestoService presupuestos, AppDbContext db) Armar()
    {
        var db = TestDbFactory.Create();
        var presupuestos = new PresupuestoService(db, new NumeracionService(db));
        return (presupuestos, db);
    }

    private static async Task<(int clienteId, int articuloId)> SeedClienteYArticulo(AppDbContext db)
    {
        var articulo = new Articulo
        {
            Codigo = "A1",
            Descripcion = "Articulo",
            PrecioUnitario = 100m,
            StockActual = 50,
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
        return (cliente.Id, articulo.Id);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task CrearAsync_CantidadInvalida_Lanza(int cantidad)
    {
        var (presupuestos, db) = Armar();
        var (clienteId, articuloId) = await SeedClienteYArticulo(db);

        var items = new List<PresupuestoItem>
        {
            new() { ArticuloId = articuloId, Cantidad = cantidad, DescuentoPct = 0m }
        };

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => presupuestos.CrearAsync(clienteId, 15, items));
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public async Task CrearAsync_DescuentoFueraDeRango_Lanza(decimal descuentoPct)
    {
        var (presupuestos, db) = Armar();
        var (clienteId, articuloId) = await SeedClienteYArticulo(db);

        var items = new List<PresupuestoItem>
        {
            new() { ArticuloId = articuloId, Cantidad = 1, DescuentoPct = descuentoPct }
        };

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => presupuestos.CrearAsync(clienteId, 15, items));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(100)]
    public async Task CrearAsync_DescuentoEnLimites_Crea(decimal descuentoPct)
    {
        var (presupuestos, db) = Armar();
        var (clienteId, articuloId) = await SeedClienteYArticulo(db);

        var items = new List<PresupuestoItem>
        {
            new() { ArticuloId = articuloId, Cantidad = 1, DescuentoPct = descuentoPct }
        };

        var creado = await presupuestos.CrearAsync(clienteId, 15, items);

        Assert.Equal(descuentoPct, creado.Items[0].DescuentoPct);
    }
}
