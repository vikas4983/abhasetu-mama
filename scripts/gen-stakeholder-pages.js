const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../src/app/(dashboard)/stakeholder');
const roles = [
  { slug: 'clinic', role: 'clinic', subs: ['appointments', 'scan-share'] },
  { slug: 'pharmacy', role: 'pharmacy', subs: ['orders', 'inventory'] },
  { slug: 'lab', role: 'lab', subs: ['orders', 'reports'] },
  { slug: 'diagnostic', role: 'diagnostic_centre', subs: ['orders', 'reports'] },
  { slug: 'insurance', role: 'insurance_org', subs: ['policies', 'eligibility'] },
  { slug: 'doctor', role: 'individual_doctor', subs: ['appointments', 'hpr'] },
  { slug: 'alumni', role: 'iqra_alumni', subs: ['directory'] },
];
for (const r of roles) {
  const dir = path.join(root, r.slug);
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'page.tsx'),
    `'use client';\nimport RoleInsightPage from '../../../../components/stakeholder/RoleInsightPage';\nexport default function Page() { return <RoleInsightPage role="${r.role}" />; }\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'docs', 'page.tsx'),
    `'use client';\nimport StakeholderDocsPage from '../../../../../components/stakeholder/StakeholderDocsPage';\nexport default function Page() { return <StakeholderDocsPage role="${r.role}" />; }\n`,
  );
  for (const sub of r.subs) {
    fs.mkdirSync(path.join(dir, sub), { recursive: true });
    const title = sub.charAt(0).toUpperCase() + sub.slice(1).replace('-', ' ');
    fs.writeFileSync(
      path.join(dir, sub, 'page.tsx'),
      `'use client';\nimport FeatureTablePage from '../../../../components/stakeholder/FeatureTablePage';\nexport default function Page() {\n  return (\n    <FeatureTablePage\n      title="${title}"\n      description="${r.slug} stakeholder — ${sub} workspace."\n      columns={['ID', 'Detail', 'ABHA']}\n      rows={[{ id: '1', col1: 'DEMO-1', col2: 'Sample record', col3: 'user@sbx', status: 'Active' }]}\n    />\n  );\n}\n`,
    );
  }
}
console.log('Stakeholder pages generated');
