const fs = require('fs');

const path = 'c:\\Docker-Proyecto-Peluqueria\\Backend-BarberShop\\src\\controllers\\dashboard.controller.js';
let content = fs.readFileSync(path, 'utf8');

const ingresosLogic = `
        /* =====================================================
           💰 INGRESOS PRODUCTOS HOY
        ===================================================== */
        const ingresosProductosAgg = await Movimiento.aggregate([
            {
                $match: {
                    sede: sedeId,
                    tipo: 'salida',
                    createdAt: {
                        $gte: inicioHoy,
                        $lte: finHoy
                    }
                }
            },
            {
                $lookup: {
                    from: 'productos',
                    localField: 'producto',
                    foreignField: '_id',
                    as: 'productoInfo'
                }
            },
            { $unwind: '$productoInfo' },
            {
                $group: {
                    _id: null,
                    totalIngresos: { 
                        $sum: { $multiply: ['$cantidad', '$productoInfo.precio'] } 
                    }
                }
            }
        ]);

        const ingresosProductosHoy = ingresosProductosAgg.length > 0 ? ingresosProductosAgg[0].totalIngresos : 0;

        res.json({`;

if (!content.includes('ingresosProductosHoy')) {
    content = content.replace("res.json({", ingresosLogic);
    content = content.replace("productosTop", "productosTop,\n            ingresosProductosHoy");
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched dashboard.controller.js with ingresosProductosHoy');
} else {
    console.log('Already patched');
}
