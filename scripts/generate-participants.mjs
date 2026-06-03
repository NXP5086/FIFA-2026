// Prebuild script — generates src/lib/participants.js from the
// PARTICIPANTS_JSON environment variable.
//
// In Vercel: set PARTICIPANTS_JSON to the JSON array (see below).
// Locally:   participants.js already exists and this script is skipped.

import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const outPath = join(dirname(fileURLToPath(import.meta.url)), '../src/lib/participants.js');

// If file already exists (local dev), do nothing
if (existsSync(outPath)) {
  console.log('generate-participants: participants.js already exists, skipping.');
  process.exit(0);
}

const raw = process.env.PARTICIPANTS_JSON;
if (!raw) {
  console.error(
    'generate-participants: PARTICIPANTS_JSON env var is not set.\n' +
    'Add it in your Vercel project settings (see README).'
  );
  process.exit(1);
}

let config;
try {
  config = JSON.parse(raw);
} catch {
  console.error('generate-participants: PARTICIPANTS_JSON is not valid JSON.');
  process.exit(1);
}

const content = `// Auto-generated at build time from PARTICIPANTS_JSON env var.
// Do not edit manually.
export const PARTICIPANT_CONFIG = ${JSON.stringify(config, null, 2)};

export function configByEmail(email) {
  if (!email) return null;
  return PARTICIPANT_CONFIG.find(p => p.email.toLowerCase() === email.trim().toLowerCase()) || null;
}
`;

writeFileSync(outPath, content);
console.log(`generate-participants: wrote ${config.length} participants to participants.js`);
