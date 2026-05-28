const fs = require('fs');

const path = 'c:\\Docker-Proyecto-Peluqueria\\Backend-BarberShop\\src\\controllers\\dashboard.controller.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('Movimiento.model')) {
    content = content.replace(
        "const Pago = require('../models/Pago.model');",
        "const Pago = require('../models/Pago.model');\nconst Movimiento = require('../models/Movimientos.model');\nconst Producto = require('../models/Producto.model');"
    );
}

const productAgg = `
        /* =====================================================
           📦 PRODUCTOS MÁS VENDIDOS
        ===================================================== */
        const productosTop = await Movimiento.aggregate([
            {
                $match: {
                    sede: sedeId,
                    tipo: 'salida',
                    createdAt: {
                        $gte: inicioSemanaActual,
                        $lte: finSemanaActual
                    }
                }
            },
            {
                $group: {
                    _id: '$producto',
                    totalVendidos: { $sum: '$cantidad' }
                }
            },
            { $sort: { totalVendidos: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'productos',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productoInfo'
                }
            },
            { $unwind: '$productoInfo' },
            {
                $project: {
                    _id: 0,
                    nombre: '$productoInfo.nombre',
                    total: '$totalVendidos'
                }
            }
        ]);

        res.json({`;

if (!content.includes('PRODUCTOS MÁS VENDIDOS')) {
    content = content.replace("res.json({", productAgg);
    content = content.replace("clienteTop", "clienteTop,\n            productosTop");
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched dashboard.controller.js');
} else {
    console.log('Already patched');
}
