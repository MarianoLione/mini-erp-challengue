using Microsoft.EntityFrameworkCore;
using MiniErp.Core.Data;
using MiniErp.Core.Models;
using MiniErp.Core.Services;
using Xunit;

namespace MiniErp.Tests;

public class NumeracionTests
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

    private static List<PresupuestoItem> UnaLinea(int articuloId) =>
    [
        new PresupuestoItem { ArticuloId = articuloId, Cantidad = 1, DescuentoPct = 0m }
    ];

    [Fact]
    public async Task Crear_BorrarUltimo_SiguienteNumeroNoReutilizaElEliminado()
    {
        var (presupuestos, db) = Armar();
        var (clienteId, articuloId) = await SeedClienteYArticulo(db);

        var primero = await presupuestos.CrearAsync(clienteId, 15, UnaLinea(articuloId));
        var segundo = await presupuestos.CrearAsync(clienteId, 15, UnaLinea(articuloId));

        Assert.Equal(1, primero.Numero);
        Assert.Equal(2, segundo.Numero);

        await presupuestos.EliminarAsync(segundo.Id);

        var tercero = await presupuestos.CrearAsync(clienteId, 15, UnaLinea(articuloId));

        Assert.Equal(3, tercero.Numero);
        Assert.False(await db.Presupuestos.AnyAsync(p => p.Numero == 2));
    }
}
