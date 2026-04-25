const fs = require('fs');

const ctrlPath = 'c:\\Docker-Proyecto-Peluqueria\\Backend-BarberShop\\src\\controllers\\producto.controller.js';
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

if (!ctrlContent.includes('Movimientos.model')) {
    ctrlContent = ctrlContent.replace(
        "const Producto = require('../models/Producto.model');",
        "const Producto = require('../models/Producto.model');\nconst Movimiento = require('../models/Movimientos.model');"
    );
}

const ventaLogic = `
// ===============================
// Registrar Venta (Reduce stock y crea movimiento)
// ===============================
const registrarVentaProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidadVenta } = req.body;

        if (!cantidadVenta || cantidadVenta <= 0) {
            return res.status(400).json({ ok: false, msg: 'La cantidad a vender debe ser mayor a 0' });
        }

        const producto = await Producto.findById(id);
        if (!producto) return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });

        if (producto.cantidad < cantidadVenta) {
            return res.status(400).json({ ok: false, msg: 'Stock insuficiente para realizar esta venta' });
        }

        // Restar stock
        producto.cantidad -= cantidadVenta;
        await producto.save();

        // Registrar movimiento de salida para el Dashboard
        await Movimiento.create({
            producto: producto._id,
            sede: producto.sede,
            tipo: 'salida',
            cantidad: cantidadVenta,
            motivo: 'Venta Directa',
            referencia: 'Venta registrada desde inventario'
        });

        res.json({ ok: true, msg: 'Venta registrada correctamente', producto });

    } catch (error) {
        console.error('Error al registrar venta:', error);
        res.status(500).json({ ok: false, msg: 'Hable con el administrador' });
    }
};

module.exports = {`;

if (!ctrlContent.includes('registrarVentaProducto')) {
    ctrlContent = ctrlContent.replace("module.exports = {", ventaLogic);
    ctrlContent = ctrlContent.replace("subirImagenProducto", "subirImagenProducto,\n    registrarVentaProducto");
    fs.writeFileSync(ctrlPath, ctrlContent, 'utf8');
}

const routesPath = 'c:\\Docker-Proyecto-Peluqueria\\Backend-BarberShop\\src\\routes\\producto.routes.js';
let routesContent = fs.readFileSync(routesPath, 'utf8');

if (!routesContent.includes('registrarVentaProducto')) {
    routesContent = routesContent.replace(
        "subirImagenProducto\n} = require('../controllers/producto.controller');",
        "subirImagenProducto,\n   registrarVentaProducto\n} = require('../controllers/producto.controller');"
    );
    routesContent = routesContent.replace(
        "// 🗑️ Eliminar (soft delete)",
        "// 💰 Registrar Venta\nrouter.post('/:id/venta', registrarVentaProducto);\n\n// 🗑️ Eliminar (soft delete)"
    );
    fs.writeFileSync(routesPath, routesContent, 'utf8');
}
console.log('Backend venta patched');
