import fs from 'fs';
import path from 'path';

const wampLogsDir = 'c:\\wamp64\\logs';

async function run() {
  if (!fs.existsSync(wampLogsDir)) {
    console.log(`Directory does not exist: ${wampLogsDir}`);
    return;
  }

  const files = fs.readdirSync(wampLogsDir);
  console.log('Files in Wamp64 logs directory:', files);

  // Search for any mysql logs
  const mysqlLogs = files.filter(f => f.toLowerCase().includes('mysql'));
  console.log('\nMySQL-related log files:', mysqlLogs);

  for (const logFile of files) {
    const filePath = path.join(wampLogsDir, logFile);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      console.log(`- ${logFile}: ${(stats.size / 1024).toFixed(2)} KB`);
    }
  }
}

run().catch(console.error);
