#!/usr/bin/env node
// Fails if demo-only screens made it into the built app (dist/).
//
// Run after `vite build --mode store` (npm run build:store does both).
// The demo flows are compiled out when the flag is off, so none of the text
// below should exist anywhere in a store build. If this fails, do not ship.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';

// Text that only the demo flows contain.
const MARKERS = [
  'Demo Mode',                 // bank connection banners
  'Demo mode',                 // OTP hint, onboarding copy
  'any 6-digit',               // "use any 6-digit OTP"
  'simulated Open Banking',    // Settings > Banking notice
  '4242 4242 4242 4242',       // mock card number
  'mock payment',              // mock checkout dialog
  'mock-checkout',             // call to the mock checkout function
];

const TEXT_FILES = new Set(['.js', '.mjs', '.html', '.css', '.json', '.webmanifest']);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

if (!existsSync(DIST)) {
  console.error(`check-store-build: no ${DIST}/ folder. Run the build first.`);
  process.exit(1);
}

const hits = [];
for (const file of walk(DIST)) {
  if (!TEXT_FILES.has(extname(file))) continue;
  const text = readFileSync(file, 'utf8');
  for (const marker of MARKERS) {
    if (text.includes(marker)) hits.push({ file, marker });
  }
}

if (hits.length > 0) {
  console.error('check-store-build: FAILED. Demo-only content is in this build:');
  for (const { file, marker } of hits) console.error(`  ${file}  contains "${marker}"`);
  console.error('Build with `npm run build:store` and do not ship this build to an app store.');
  process.exit(1);
}

console.log('check-store-build: OK. No demo bank connection or mock checkout in this build.');
