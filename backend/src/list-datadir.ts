import fs from 'fs';
import path from 'path';

const datadir = 'c:\\wamp64\\bin\\mysql\\mysql9.1.0\\data';

async function run() {
  if (!fs.existsSync(datadir)) {
    console.log(`Directory does not exist: ${datadir}`);
    return;
  }

  const files = fs.readdirSync(datadir);
  console.log('Files in datadir:', files);

  // Filter for potential log files
  const logFiles = files.filter(f => f.endsWith('.log') || f.endsWith('.err') || f.includes('query') || f.includes('mysql'));
  console.log('\nPotential MySQL log files:', logFiles);
}

run().catch(console.error);
