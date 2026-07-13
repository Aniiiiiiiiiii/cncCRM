import fs from 'fs';
import path from 'path';

const mysqlLogPath = 'c:\\wamp64\\logs\\mysql.log';

async function run() {
  if (!fs.existsSync(mysqlLogPath)) {
    console.log(`Log file does not exist: ${mysqlLogPath}`);
    return;
  }

  console.log(`Reading log file: ${mysqlLogPath}`);
  const content = fs.readFileSync(mysqlLogPath, 'utf8');
  const lines = content.split('\n');
  console.log(`Analyzing ${lines.length} lines in mysql.log...`);

  let matchCount = 0;
  const targets = ['no@gmial.com', '31st July', '31st', 'gmial', 'asked to call'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const target of targets) {
      if (line.toLowerCase().includes(target.toLowerCase())) {
        matchCount++;
        console.log(`\n[MATCH FOUND] Line ${i + 1}:`);
        // Print surrounding context
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length - 1, i + 5);
        for (let k = start; k <= end; k++) {
          const prefix = k === i ? '>>> ' : '    ';
          console.log(`${prefix}${k + 1}: ${lines[k].trim()}`);
        }
        break; // Show once per matching line
      }
    }
  }

  console.log(`\nScan complete. Found ${matchCount} matches in mysql.log.`);
}

run().catch(console.error);
