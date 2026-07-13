import fs from 'fs';
import path from 'path';

const transcriptPath = 'C:\\Users\\raj22\\.gemini\\antigravity\\brain\\47898444-857a-4e1c-8074-792dfc4ebe03\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  if (!fs.existsSync(transcriptPath)) {
    console.log('Transcript file does not exist at path:', transcriptPath);
    return;
  }

  console.log('Reading transcript file...');
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  console.log(`Analyzing ${lines.length} lines in transcript...`);

  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const obj = JSON.parse(line);
      const contentStr = JSON.stringify(obj.content || '');
      
      // Look for text that looks like a lead list or contains lead details
      if (
        obj.type === 'USER_INPUT' && (
          contentStr.toLowerCase().includes('lead') ||
          contentStr.toLowerCase().includes('phone') ||
          contentStr.toLowerCase().includes('email') ||
          contentStr.toLowerCase().includes('company')
        )
      ) {
        console.log(`\n--- Match found in User Input at line ${i} ---`);
        console.log(obj.content);
        count++;
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  console.log(`\nSearch complete. Found ${count} matching user inputs.`);
}

run().catch(console.error);
