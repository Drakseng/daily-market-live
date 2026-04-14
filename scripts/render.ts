import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const root = path.join(__dirname, '..');

// ── Step 1: fetch live market data ───────────────────────────────────────────
console.log('[1/2] Fetching live market data...');
execSync('npx tsx src/fetchData.ts', { stdio: 'inherit', cwd: root });

// ── Step 2: render video ──────────────────────────────────────────────────────
const outDir = path.join(root, 'out');
fs.mkdirSync(outDir, { recursive: true });

const today = new Date()
  .toISOString()
  .slice(0, 10); // YYYY-MM-DD
const outFile = `out/bist-daily-${today}.mp4`;

console.log(`[2/2] Rendering video → ${outFile}`);
execSync(
  `npx remotion render BistMarketSummary ${outFile}`,
  { stdio: 'inherit', cwd: root },
);

console.log(`\nDone. Video saved to ${outFile}`);
