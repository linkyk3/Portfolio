import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, '..', '..');
const outputFile = resolve(projectRoot, 'artifacts', 'portfolio', 'src', 'changelog.json');

// The git log command format:
// %h: abbreviated commit hash
// %ad: author date
// %s: subject
const command = `git log --pretty=format:%h%x1F%ai%x1F%s`;

exec(command, { cwd: projectRoot }, (err, stdout) => {
  if (err) {
    console.error('Error getting git log:', err);
    return;
  }

  const logs = stdout.split('\n').map(line => {
    const [sha, isodate, summary] = line.split('\x1f');
    if (!sha || !isodate) return null;

    const date = new Date(isodate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return { sha, date: `${day}-${month}-${year} ${hours}:${minutes}`, summary };
  }).filter(log => log); // Filter out any empty lines

  try {
    const jsonOutput = JSON.stringify(logs, null, 2);
    writeFile(outputFile, jsonOutput);
    console.log(`Changelog updated successfully at ${outputFile}`);
  } catch (parseError) {
    console.error('Error parsing git log JSON:', parseError);
  }
});
