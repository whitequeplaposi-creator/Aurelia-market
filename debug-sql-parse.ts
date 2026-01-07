import * as fs from 'fs';

const sqlFile = fs.readFileSync('database/turso-complete-setup.sql', 'utf-8');

const statements = sqlFile
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Total statements: ${statements.length}\n`);

statements.forEach((stmt, i) => {
  const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
  console.log(`${i + 1}. ${preview}...`);
});
