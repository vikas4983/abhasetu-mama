const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../src/app/(dashboard)/stakeholder');

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (name === 'page.tsx') {
      const parts = p.replace(/\\/g, '/').split('/stakeholder/')[1].split('/');
      if (parts.length > 2) {
        let c = fs.readFileSync(p, 'utf8');
        const fixed = c.replace(
          "from '../../../../components/stakeholder/",
          "from '../../../../../components/stakeholder/",
        );
        if (fixed !== c) fs.writeFileSync(p, fixed);
      }
    }
  }
}
walk(root);
console.log('Import paths fixed');
