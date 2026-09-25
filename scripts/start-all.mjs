// Runs the site in both languages, like production, so the flags work locally.
//
// `ng serve` builds one language at a time, so this starts two dev servers:
//   French  on http://localhost:4200/       (forwards /en/* to the English one)
//   English on http://localhost:4201/en/
// Browse http://localhost:4200/. Ctrl+C stops both.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

// The Angular CLI run directly by Node — no shell or npx in between, so
// kill() reaches the server itself, on every OS.
const ng = createRequire(import.meta.url).resolve('@angular/cli/bin/ng.js');

const servers = [
  ['en', 'development-en'],
  ['fr', 'development-all'],
].map(([name, configuration]) => {
  const child = spawn(process.execPath, [ng, 'serve', `--configuration=${configuration}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n')) {
        if (line.trim()) console.log(`[${name}] ${line}`);
      }
    });
  }
  return child;
});

// One server failing (a port in use, a build error) would leave the site
// half-working: stop everything instead.
function stopAll(code) {
  for (const child of servers) child.kill();
  process.exit(code);
}

for (const child of servers) child.on('exit', (code) => stopAll(code ?? 0));
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
