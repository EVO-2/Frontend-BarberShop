const fs = require('fs');

const path = 'c:\\Docker-Proyecto-Peluqueria\\Backend-BarberShop\\src\\controllers\\reportes.controller.js';
let c = fs.readFileSync(path, 'utf8');

// Replace fechaBase with fecha
c = c.replace(/fechaBase:\s*rangoFechas/g, 'fecha: rangoFechas');

// Replace date parsing
const oldRange = /const rangoFechas = \{[\s\S]*?\$lte: new Date\(`\$\{fechaFin\}T23:59:59\.999Z`\),?[\s\S]*?\};/g;

const newRange = `const rangoFechas = {
      $gte: new Date(\`\${fechaInicio}T05:00:00.000Z\`),
      $lte: new Date(new Date(\`\${fechaFin}T04:59:59.999Z\`).getTime() + 24 * 60 * 60 * 1000)
    };`;

c = c.replace(oldRange, newRange);

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed dates in backend!');
