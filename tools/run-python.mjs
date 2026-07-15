import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const userArgs = process.argv.slice(2);

if (!userArgs.length) {
  console.error('Usage: node tools/run-python.mjs <script-or-args>');
  process.exit(2);
}

const candidates = [];
if (process.platform === 'win32') {
  const venvPython = path.join(root, '.asset-venv', 'Scripts', 'python.exe');
  if (fs.existsSync(venvPython)) candidates.push([venvPython, []]);
  candidates.push(['py', ['-3']], ['py', []], ['python', []], ['python3', []]);
} else {
  const venvPython = path.join(root, '.asset-venv', 'bin', 'python');
  if (fs.existsSync(venvPython)) candidates.push([venvPython, []]);
  candidates.push(['python3', []], ['python', []]);
}

for (const [command, prefixArgs] of candidates) {
  const result = spawnSync(command, [...prefixArgs, ...userArgs], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });
  if (result.error?.code === 'ENOENT') continue;
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

console.error('Python was not found. Install Python or create .asset-venv first.');
process.exit(1);
