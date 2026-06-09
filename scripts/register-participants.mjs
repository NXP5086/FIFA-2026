// One-time script to pre-register all participants in Supabase auth
// and pre-populate their profile rows.
//
// Run: node scripts/register-participants.mjs
//
// Requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
// Get service role key: Supabase → Settings → API → service_role key

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PARTICIPANT_CONFIG } from '../src/lib/participants.js';

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

// Fetch all existing auth users so we can skip creates and resolve UUIDs
const { data: { users: existingUsers }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listErr) { console.error('Failed to list users:', listErr.message); process.exit(1); }

const emailToUid = new Map(existingUsers.map(u => [u.email.toLowerCase(), u.id]));

console.log(`Found ${existingUsers.length} existing auth users.`);
console.log(`Seeding ${PARTICIPANT_CONFIG.length} participants…\n`);

let created = 0, skipped = 0, failed = 0;

for (const { email, internal_id, name, initials, color } of PARTICIPANT_CONFIG) {
  const key = email.toLowerCase();
  let uid = emailToUid.get(key);

  if (!uid) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) {
      console.error(`  ✗  ${email}  →  ${error.message}`);
      failed++;
      continue;
    }
    uid = data.user.id;
    created++;
  } else {
    skipped++;
  }

  // Upsert profile row (safe to run again — won't overwrite existing data)
  const { error: upsertErr } = await supabase
    .from('profiles')
    .upsert({ id: uid, internal_id, name, initials, color }, { onConflict: 'id' });

  if (upsertErr) {
    console.error(`  ✗  profile for ${email}  →  ${upsertErr.message}`);
    failed++;
  } else {
    const tag = uid === emailToUid.get(key) ? '–' : '✓';
    console.log(`  ${tag}  ${name.padEnd(12)} ${email}`);
  }
}

console.log(`\nAuth users: ${created} created · ${skipped} already existed · ${failed} failed`);
console.log('Profiles upserted for all successful users.');
