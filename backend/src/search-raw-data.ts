import fs from 'fs';
import path from 'path';

const targetDir = 'c:\\wamp64\\bin\\mysql\\mysql9.1.0\\data\\cnc_crm';

function extractStrings(buffer: Buffer): string[] {
  const found: string[] = [];
  let currentString = '';
  
  for (let i = 0; i < buffer.length; i++) {
    const charCode = buffer[i];
    
    // Check for printable ASCII characters
    if (charCode >= 32 && charCode <= 126) {
      currentString += String.fromCharCode(charCode);
    } else {
      if (currentString.length >= 4) {
        found.push(currentString);
      }
      currentString = '';
    }
  }
  if (currentString.length >= 4) {
    found.push(currentString);
  }
  
  return found;
}

async function run() {
  if (!fs.existsSync(targetDir)) {
    console.log(`Directory does not exist: ${targetDir}`);
    return;
  }

  console.log(`Scanning directory: ${targetDir}`);
  const files = fs.readdirSync(targetDir);
  console.log('Files in DB directory:', files);

  for (const file of files) {
    if (!file.endsWith('.MYD')) continue;

    const filePath = path.join(targetDir, file);
    console.log(`\nScanning file: ${filePath}`);

    try {
      const stats = fs.statSync(filePath);
      console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

      const buffer = fs.readFileSync(filePath);
      console.log('Reading file bytes into memory...');

      const strings = extractStrings(buffer);
      console.log(`Extracted ${strings.length} printable strings.`);

      if (file === 'lead.MYD') {
        console.log('\n--- DUMPING ALL STRINGS FROM lead.MYD ---');
        strings.forEach((str, index) => {
          console.log(`[${index}]: "${str}"`);
        });
        console.log('-----------------------------------------\n');
      }
    } catch (e: any) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
}

run().catch(console.error);
