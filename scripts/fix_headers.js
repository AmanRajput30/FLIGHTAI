const fs = require('fs');
const path = require('path');

const walk = (dir) => { 
  fs.readdirSync(dir).forEach(file => { 
    const p = path.join(dir, file); 
    if (fs.statSync(p).isDirectory()) {
      walk(p); 
    } else if (p.endsWith('.tsx')) { 
      let c = fs.readFileSync(p, 'utf8'); 
      let original = c;
      c = c.replace(/<Header variant="full" \/>/g, '<Header />'); 
      c = c.replace(/<Header variant="compact" \/>/g, '<Header />'); 
      if (c !== original) {
        fs.writeFileSync(p, c); 
        console.log('Fixed', p);
      }
    } 
  }); 
}; 

walk('C:\\Users\\DELL\\OneDrive\\Desktop\\AI\\flightai\\src\\app');
