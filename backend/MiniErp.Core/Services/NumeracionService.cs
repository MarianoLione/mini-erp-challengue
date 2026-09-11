using Microsoft.EntityFrameworkCore;
using MiniErp.Core.Data;
using MiniErp.Core.Models;

namespace MiniErp.Core.Services;

public class NumeracionService
{
    private readonly AppDbContext _db;

    public NumeracionService(AppDbContext db) => _db = db;

    public async Task<int> ProximoNumeroPresupuestoAsync()
    {
        var numerador = await _db.Numeradores.FirstOrDefaultAsync(n => n.Clave == "Presupuesto");
        if (numerador is null)
        {
            var maxExistente = await _db.Presupuestos.MaxAsync(p => (int?)p.Numero) ?? 0;
            numerador = new Numerador { Clave = "Presupuesto", UltimoNumero = maxExistente };
            _db.Numeradores.Add(numerador);
        }

        numerador.UltimoNumero++;
        return numerador.UltimoNumero;
    }

    public async Task<int> ProximoNumeroFacturaAsync()
    {
        var max = await _db.Facturas.MaxAsync(f => (int?)f.Numero) ?? 0;
        return max + 1;
    }
}
