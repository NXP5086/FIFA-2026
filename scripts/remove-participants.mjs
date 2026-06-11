// One-time script to remove participants from Supabase auth and profiles.
//
// Run: node scripts/remove-participants.mjs
//
// Requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const EMAILS_TO_REMOVE = [
  'emmanuelamrittopno@gmail.com',  // Amrit
  'vijitkumar30@gmail.com',        // Vijit
  'gaithaingamkamei@gmail.com',    // Gai
  'benriohmt@gmail.com',           // Benrio
  'nzamo.kikon7987@gmail.com',     // Nzamo
];

const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const supabaseUrl    = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data: { users: existingUsers }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listErr) { console.error('Failed to list users:', listErr.message); process.exit(1); }

const emailToUid = new Map(existingUsers.map(u => [u.email.toLowerCase(), u.id]));

console.log(`Removing ${EMAILS_TO_REMOVE.length} participants…\n`);

let removed = 0, notFound = 0, failed = 0;

for (const email of EMAILS_TO_REMOVE) {
  const uid = emailToUid.get(email.toLowerCase());

  if (!uid) {
    console.log(`  –  ${email}  →  not found in auth (skipping)`);
    notFound++;
    continue;
  }

  // Delete profile row first (FK reference to auth.users)
  const { error: profileErr } = await supabase.from('profiles').delete().eq('id', uid);
  if (profileErr) {
    console.error(`  ✗  profile for ${email}  →  ${profileErr.message}`);
    failed++;
    continue;
  }

  // Delete auth user
  const { error: authErr } = await supabase.auth.admin.deleteUser(uid);
  if (authErr) {
    console.error(`  ✗  auth user ${email}  →  ${authErr.message}`);
    failed++;
    continue;
  }

  console.log(`  ✓  ${email}  removed`);
  removed++;
}

console.log(`\n${removed} removed · ${notFound} not found · ${failed} failed`);
