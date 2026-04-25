const fs = require('fs');
const path = 'c:\\Docker-Proyecto-Peluqueria\\Backend-BarberShop\\src\\controllers\\dashboard.controller.js';
let content = fs.readFileSync(path, 'utf8');

// Fix the mangled `const productosTop, ingresosProductosHoy = await Movimiento.aggregate`
content = content.replace(
    "const productosTop,\n            ingresosProductosHoy = await Movimiento.aggregate",
    "const productosTop = await Movimiento.aggregate"
);

// We need to add ingresosProductosHoy back to the res.json. Let's find it at the bottom.
// Wait, the first time I did `replace`, I probably completely missed adding it to `res.json`.
// Let's replace the last `productosTop` inside `res.json` with `productosTop, ingresosProductosHoy`.
// We can use a regex that matches `productosTop\n        });`
content = content.replace(
    /productosTop\s*\n\s*\}\);/g,
    "productosTop,\n            ingresosProductosHoy\n        });"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed syntax error in dashboard.controller.js');
